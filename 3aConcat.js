// the purpose of this file is to concatenate the prepped file to the main file
const dfd = require("danfojs-node");

var inputFileName = "2.AddCol/Aug2021_addcol.csv";
var oldMergedFileName = "3.Concat/jan_jul_concat.csv";
var finalMergedFileName = "3.Concat/jan_aug_concat.csv";

dfd
  .read_csv(oldMergedFileName) //OLD Main File
  .then((df1) => {
    dfd
      .read_csv(inputFileName) //New Month to add to OLD Main File, using June as new month
      .then((df2) => {
        if (df1.shape[1] === df2.shape[1]) {
          const dfMain = dfd.concat({ df_list: [df1, df2], axis: 0 });

          dfMain.to_csv(finalMergedFileName).catch((err) => { //New Main File, using June as a new month for example
            console.log(err);
          });

          console.log(`${df1.shape[1]} is compatible with ${df2.shape[1]}`);
        } else {
          console.log(`${df1.shape[1]} is NOT compatible with ${df2.shape[1]}`);
        }
      })
      .catch((err) => {
        console.log(err);
      });
      console.log("Concatenated, output merged file: %s, new input file: %s, old merged file: %s", finalMergedFileName, inputFileName, oldMergedFileName);
  })
  .catch((err) => {
    console.log(err);
  });
