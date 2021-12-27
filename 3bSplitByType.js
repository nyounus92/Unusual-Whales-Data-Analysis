// this file divides the alerts into deciles and calculates the probablility of winning
const dfd = require("danfojs-node");

var inputFileName = "3.Concat/jan_aug_concat.csv";
var callOutputFileName = "3.Concat/jan_aug_call_with_winner.csv";
var putOutputFileName = "3.Concat/jan_aug_put_with_winner.csv";

dfd
  .read_csv(inputFileName)
  .then((df) => {
    // MAKE SURE THESE VARIABLES ARE CORRECT BEFORE RUNNING
    var optionType = "put";
    const winDefinition = [10, 25, 50, 75, 100];

    /*
    MAKE QUERY FOR JUST optionType
    */
    var dfOptionType = df.query({
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
    OUTPUT AS CSV FILE
    */
    dfOptionType
      .to_csv(putOutputFileName)
      .then(console.log("Puts processed, output file: %s, input file: %s", putOutputFileName, inputFileName))
      .catch((err) => {
        console.log(err);
      });

      //Process Calls
      optionType = "call";

      dfOptionType = df.query({
        column: "option_type",
        is: "==",
        to: optionType,
      });

      winDefinition.forEach((currentWinDef) => {
        // these winner columns are necessary for queries we have to make in the future
        const winner = dfOptionType["adj_high_return"].ge(currentWinDef);
        dfOptionType.addColumn({
          column: `winner_${currentWinDef}`,
          value: winner,
        });
      });

      dfOptionType
      .to_csv(callOutputFileName)
      .then(console.log("Calls processed, output file: %s, input file: %s", callOutputFileName, inputFileName))
      .catch((err) => {
        console.log(err);
      });

  })
  .catch((err) => {
    console.log(err);
  });