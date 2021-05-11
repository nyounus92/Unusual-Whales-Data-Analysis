// this file divides the alerts into deciles and calculates the probablility of winning
const dfd = require("danfojs-node");

const returnBucketIndices = (numOfAlerts, numOfBuckets) => {
  const bucketSize = Math.ceil(numOfAlerts / numOfBuckets);

  // create array of uniform buckets
  const bucketSizes = [];
  for (let i = 0; i < 10; i++) {
    bucketSizes.push(bucketSize);
  }

  // iterate from the back of the array by subtracting one from each bucket
  // until the appropriate numOfAlerts is reached
  let i = 9;
  while (bucketSizes.reduce((a, b) => a + b, 0) > numOfAlerts) {
    bucketSizes[i] = bucketSizes[i] - 1;
    i = i - 1;
  }

  // create index points for the buckets
  const bucketIndices = [];
  i = 0;
  bucketSizes.forEach((size) => {
    bucketIndices.push(i + size);
    i = i + size;
  });

  return bucketIndices;
};

dfd
  .read_csv("3.Concat/dec20_to_mar21.csv")
  .then((df) => {
    // MAKE SURE THESE VARIABLES ARE CORRECT BEFORE RUNNING
    const optionType = "put";
    const winDefinition = [10, 25, 50, 75, 100];
    const variables = [
      "ask",
      "bid",
      "delta",
      "buy_amount",
      "expires_in",
      "gamma",
      "implied_volatility",
      "open_interest",
      "theta",
      "vega",
      "vol_oi",
      "volume",
      "total",
    ];

    /*
    MAKE QUERY FOR JUST optionType
    */
    const dfOptionType = df.query({
      column: "option_type",
      is: "==",
      to: optionType,
    });

    /*
    MAKE winner COLUMN FOR EACH WIN DEFINITION
    */
    winDefinition.forEach((currentWinDef) => {
      // these winner columns are necessary for queries we have to make in the future
      const winner = dfOptionType["adj_high_return"].ge(currentWinDef);
      dfOptionType.addColumn({
        column: `winner_${currentWinDef}`,
        value: winner,
      });
    });

    /*
    CALCULATE BUCKETS
    */
    const numOfAlerts = dfOptionType["option_type"].size;
    const bucketIndices = returnBucketIndices(numOfAlerts, 10);

    /*
    MAIN LOOP FOR VARIABLES
    */
    const outputArr = []; // final output
    variables.forEach((currentVar) => {
      // create total row
      if (currentVar == "total") {
        const output = [];
        output[0] = currentVar;
        output[1] = "N/A";
        output[2] = dfOptionType["option_type"].size;
        output[3] = "N/A";
        output[4] = "N/A";
        output[10] = dfOptionType["adj_high_return"].mean();
        output[13] = 0;
        output[14] = output[2];

        winDefinition.forEach((currentWinDef, i) => {
          const dfWin = dfOptionType.query({
            column: `winner_${currentWinDef}`,
            is: "==",
            to: true,
          });
          const wins = dfWin["option_type"].size;
          i = i + 5;
          output[i] = wins / output[2];

          // add days_to_high average and standard deviation for winners
          if (currentWinDef === 25) {
            output[11] = dfWin["days_to_high"].mean();
            output[12] = dfWin["days_to_high"].std();
          }
        });

        outputArr.push(output);
      } else {
        /*
        CREATE ROWS FOR EVERYTHING ELSE BESIDES TOTAL
        */
        // sort by currentVar
        dfOptionType.sort_values({ by: currentVar, inplace: true });
        dfOptionType.reset_index(true);

        // run for each bucket
        let prevBucketIndex = 0;
        bucketIndices.forEach((v, i) => {
          // creating bucket
          const subDFOptionType = dfOptionType.iloc({
            rows: [`${prevBucketIndex}:${v}`],
            columns: ["0:"],
          });

          // creating array of outputs
          const output = [];
          output[0] = currentVar;
          output[1] = i + 1;
          output[2] = subDFOptionType["option_type"].size;
          output[3] = subDFOptionType[currentVar].min();
          output[4] = subDFOptionType[currentVar].max();
          output[10] = subDFOptionType["adj_high_return"].mean();
          output[13] = prevBucketIndex;
          output[14] = v;

          winDefinition.forEach((currentWinDef, i) => {
            const subDFwin = subDFOptionType.query({
              column: `winner_${currentWinDef}`,
              is: "==",
              to: true,
            });
            const wins = subDFwin["option_type"].size;
            i = i + 5;
            output[i] = wins / output[2];

            // add days_to_high average and standard deviation for winners
            if (currentWinDef === 25) {
              output[11] = subDFwin["days_to_high"].mean();
              output[12] = subDFwin["days_to_high"].std();
            }
          });

          // push array to final array of outputs
          outputArr.push(output);

          prevBucketIndex = v;
        });
      }
    });

    /*
    CREATE DATAFRAME OUTPUT
    */
    const dfOutput = new dfd.DataFrame(outputArr, {
      columns: [
        "Var",
        "Decile",
        "alerts_in_sample",
        "Min",
        "Max",
        "10",
        "25",
        "50",
        "75",
        "100",
        "avg_high_return",
        "avg_days_to_high_for_winner_25",
        "std_days_to_high_for_winner_25",
        "index_start",
        "index_end",
      ],
    });

    /*
    OUTPUT AS CSV FILE
    */
    dfOutput.to_csv("5.WinProb/WinProbPut.csv").catch((err) => {
      console.log(err);
    });
  })
  .catch((err) => {
    console.log(err);
  });
