// the purpose of this file is to concatenate the prepped file to the main file
const dfd = require("danfojs-node");

dfd
  .read_csv("3.Concat/May2021_concat.csv") //OLD Main File
  .then((df1) => {
    dfd
      .read_csv("2.AddCol/June2021_addcol.csv") //New Month to add to OLD Main File, using June as new month
      .then((df2) => {
        if (df1.shape[1] === df2.shape[1]) {
          const dfMain = dfd.concat({ df_list: [df1, df2], axis: 0 });

          dfMain.to_csv("3.Concat/June2021_concat.csv").catch((err) => { //New Main File, using June as a new month for example
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
  })
  .catch((err) => {
    console.log(err);
  });
