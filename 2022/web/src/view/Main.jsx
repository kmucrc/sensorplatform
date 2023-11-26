/* eslint-disable no-unused-vars */
import "date-fns";
import React, { useState, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import DateFnsUtils from "@date-io/date-fns";
import { Line } from "react-chartjs-2";
import "./Main.css";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import axios from "axios";
import Map from "../component/Map";
const WEEK = 7;

/*
  datatype        | data field
  oximetry        | HbA1c
                  | Heart Rate
                  | spo2
  humanactivity   | bodytemp, humi, temp
                  | 걸음수 이동거리
                  | gps
  humaninformation| all(7 kinds sensing data)
  athietics       | all (총 걸음수, 총 이동거리, 총 소모칼로리, 최저 심박수, 최고 심박수)
*/

const Main = () => {
  // 검색 및 분류를 위한 데이터 셋
  const [data, setData] = useState([
    {
      type: "oximetry",
      name: "oximetry",
      field: [
        {
          type: ["hba1c", "createdtime"],
          name: "HbA1c(당화혈색소)",
        },
        {
          type: ["heartrate", "createdtime"],
          name: "Heart rate(심박수)",
        },
        {
          type: ["spo2", "createdtime"],
          name: "SpO2(산소포화도)",
        },
      ],
    },
    {
      type: "humanactivity",
      name: "human activity",
      field: [
        {
          type: ["bodytemp", "temp", "humi", "createdtime"],
          name: "체온, 온도, 습도",
        },
        {
          type: ["step", "distance", "createdtime"],
          name: "걸음 수, 이동거리",
        },
        {
          type: ["gps", "createdtime"],
          name: "gps",
        },
      ],
    },
    {
      type: "athietics",
      name: "athietics",
      field: [
        {
          type: ["totalstep", "createdtime"],
          name: "총 걸음수",
        },
        {
          type: ["totaldistance", "createdtime"],
          name: "총 이동거리",
        },
        {
          type: ["totalcarlory", "createdtime"],
          name: "총 소모칼로리",
        },
        {
          type: ["minheartrate", "createdtime"],
          name: "최저 심박수",
        },
        {
          type: ["maxheartrate", "createdtime"],
          name: "최고 심박수",
        },
      ],
    },
    {
      type: "human information",
      name: "human information",
      field: [
        {
          type: ["all", "all"],
          name: "all",
        },
      ],
    },
  ]);

  // loading
  const [loading, setLoading] = useState(false);

  //그룹아이디 검색을 위한 데이터 셋
  const [groupIdList, setGroupIdList] = useState([1, 2, 3, 4, 5]);
  //그룹아이디 현재 검색 상태
  const [groupId, setGroupId] = useState(1);
  //쿼리데이터 현재 검색 상태
  const [queryData, setQueryData] = useState([]);

  //날짜 검색 7일 간 default 검색을 위한 셋
  var threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - WEEK);
  const [startDate, setStartDate] = useState(threeDaysAgo);
  const [endDate, setEndDate] = useState(new Date());

  //data type 선택을 위한 셋
  const [selectType, setSelectType] = useState("oximetry");
  //data field 선택을 위한 셋
  const [selectField, setSelectField] = useState(["hba1c", "createdtime"]);
  const [selectFieldType, setSelectFieldType] = useState([
    "hba1c",
    "createdtime",
  ]);
  //data field set
  const [field, setField] = useState([]);
  //차트 데이터와 라벨 설정을 위한 셋
  const [chartLabel, setChartLabel] = useState([]);
  const [chartData, setChartData] = useState([]);
  //테이블 데이터와 라벨 설정을 위한 셋
  const [tableData, setTableData] = useState([]);

  const [h_chartData, setHChartData] = useState({});
  const [h_tableData, setHTableData] = useState([]);
  const [stepTableData, setStepTableData] = useState([]);

  //쿼리데이터 설정
  const getQueryData = async () => {
    // await axios
    //   .get(
    //     "https://3d2jb7xavd.execute-api.ap-northeast-2.amazonaws.com/new/proxyLambda",
    //     {
    //       headers: { accept: "Application/json" },
    //       params: {
    //         query: JSON.stringify({ size: 100, _source: "oximetry", "query": { "match_all": {}}}),
    //         index: selectType,
    //         source_conent_type: "Application/json",
    //         // auth: JSON.stringify({
    //         //   id: process.env.REACT_APP_OPENSEARCH_ID,
    //         //   pw: process.env.REACT_APP_OPENSEARCH_PW,
    //         // }),
    //       },
    //     }
    //   )
    //   .then(console.log)
    //   .catch((e) => console.error(e));

    // return;

    setLoading(true);

    setQueryData([]);
    var q = {};
    // Human information 검색시 쿼리데이터
    if (selectType === "human information") {
      q = {
        size: 1000,
        query: {
          bool: {
            must: [
              { match: { groupid: groupId } },
              {
                bool: {
                  should: [
                    { match: { _index: "oximetry" } },
                    { match: { _index: "humidity" } },
                  ],
                },
              },
            ],
          },
        },
      };
    }
    // Human information 제외 다른 필드 검색시 쿼리데이터
    else {
      q = {
        size: 1000,
        _source: selectFieldType,
        query: {
          bool: {
            must: [
              { match: { _index: selectType } },
              { match: { groupid: groupId } },
            ],
          },
        },
      };
    }
    // cons ole.log(selectType);
    console.log(q);
    // return;
    await axios
      .get(
        "https://3d2jb7xavd.execute-api.ap-northeast-2.amazonaws.com/new/proxyLambda",
        {
          headers: { accept: "application/json" },
          params: {
            query: JSON.stringify(q),
            index: selectType,
            source_conent_type: "application/json",
            // auth: JSON.stringify({
            //   id: process.env.REACT_APP_OPENSEARCH_ID,
            //   pw: process.env.REACT_APP_OPENSEARCH_PW,
            // }),
          },
        }
      )
      .then(function (res) {
        console.log(res);
        const data = JSON.parse(res.data.body);
        console.log(data);
        if (data.status === 404) {
          alert("해당 인덱스를 찾을 수 없습니다 : " + selectType);
          return;
        }
        console.log(data["hits"]);

        // return;
        const hits = JSON.parse(res.data.body).hits;
        if (hits.hits.length === 0) {
          alert("검색조건에 맞는 데이터가 존재하지 않습니다.");
        } else {
          setQueryData(hits.hits);
        }
      })
      .catch(function (error) {
        alert("데이터를 가져오지 못하였습니다. " + error);
        setQueryData([]);
      });
    setLoading(false);
  };

  //date 설정을 위한 함수
  const handleStartDateChange = (date) => {
    setStartDate(date);
  };
  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  //select type이 바뀔 때 그에 맞는 field 리스트를 바꾸는 함수
  useEffect(() => {
    for (var i = 0; i < data.length; i++) {
      if (data[i].type === selectType) {
        setField(data[i].field);
        setSelectField(data[i].field[0].type);
        setSelectFieldType(data[i].field[0].type);
      }
    }
  }, [selectType, data]);

  //field 변경에 따른 쿼리 데이터 검색을 위한 추가
  useEffect(() => {
    if (!Array.isArray(selectField)) {
      var arrayField = [];
      var splitField = selectField.split(",");
      splitField.forEach((e) => {
        arrayField.push(e);
      });
      setSelectFieldType(arrayField);
    }
  }, [selectField]);

  // 검색 함수
  const search = () => {
    let searchDataList = queryData.filter((q) => {
      const date_q = new Date(q._source?.createdtime?.replace(" ", "T"));
      console.log(date_q, startDate, endDate);
      if (date_q) {
        if (date_q >= startDate && date_q <= endDate) {
          return true;
        }
      }
      return false;
    });
    console.log({ searchDataList });
    let tableDataList = [];
    let dataList = [];
    let dateList = [];

    //검색 데이터가 존재하지 않을 시
    if (searchDataList.length === 0) {
      //상태 초기화
      setChartLabel([]);
      setChartData([]);
      setTableData([]);
      setHChartData([]);
      setHTableData([]);

      alert("검색된 데이터가 존재하지 않습니다.");
      return;
    }

    // 데이터를 시간 순으로 정렬하기
    searchDataList.sort(function (a, b) {
      return (
        new Date(a._source.createdtime.replace(" ", "T")) -
        new Date(b._source.createdtime.replace(" ", "T"))
      );
    });

    // 상태 초기화 //
    setChartLabel([]);

    setChartData([]);
    setHChartData([]);

    setTableData([]);
    setHTableData([]);

    // chart
    console.log(searchDataList);
    // date label
    dateList = searchDataList.map((data) => data._source.createdtime);
    setChartLabel(dateList);

    // check is multiple chart
    const isHChart = Object.entries(searchDataList[0]._source).length > 2;
    console.log({ isHChart });

    if (isHChart) {
      if (selectType === "humanactivity") {
        if (selectFieldType[0] === "bodytemp") {
          const bodytemp = searchDataList.map((data) =>
            parseFloat(data._source["bodytemp"].value)
          );
          const temp = searchDataList.map((data) =>
            parseFloat(data._source["temp"].value)
          );
          const humi = searchDataList.map((data) =>
            parseFloat(data._source["humi"].value)
          );
          // datasets =;
          console.log(searchDataList, bodytemp, temp, humi);
          setHChartData({
            labels: dateList,
            datasets: [
              {
                label: "체온",
                data: bodytemp,
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgb(255, 99, 132)",
                borderWidth: 3,
                yAxisID: "y1",
              },
              {
                label: "기온",
                data: temp,
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgb(54, 162, 235)",
                borderWidth: 3,
                yAxisID: "y1",
              },
              {
                label: "습도",
                data: humi,
                backgroundColor: "rgba(201, 203, 207, 0.2)",
                borderColor: "rgb(201, 203, 207)",
                borderWidth: 3,
                yAxisID: "y2",
              },
            ],
          });
          tableDataList = dateList.map((value, idx) => ({
            date: value,
            [selectFieldType[0]]:
              searchDataList[idx]._source[selectFieldType[0]].value,
            [selectFieldType[1]]:
              searchDataList[idx]._source[selectFieldType[1]].value,
            [selectFieldType[2]]:
              searchDataList[idx]._source[selectFieldType[2]].value,
          }));
        } else if (selectFieldType[0] === "step") {
          const step = searchDataList.map((data) =>
            parseFloat(data._source["step"].value)
          );
          const distance = searchDataList.map((data) =>
            parseFloat(data._source["distance"].value)
          );
          setHChartData({
            labels: dateList,
            datasets: [
              {
                label: "걸음수",
                data: step,
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgb(255, 99, 132)",
                borderWidth: 3,
                yAxisID: "y1",
              },
              {
                label: "거리",
                data: distance,
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgb(54, 162, 235)",
                borderWidth: 3,
                yAxisID: "y2",
              },
            ],
          });
          tableDataList = dateList.map((value, idx) => ({
            date: value,
            [selectFieldType[0]]:
              searchDataList[idx]._source[selectFieldType[0]].value,
            [selectFieldType[1]]:
              searchDataList[idx]._source[selectFieldType[1]].value,
          }));
        } else {
          //gps
        }
      }
    } else {
      dataList = searchDataList.map(
        (data) => data._source[selectFieldType[0]].value
      );
      console.log({ dataList });
      tableDataList = dateList.map((value, idx) => ({
        date: value,
        [selectFieldType[0]]:
          searchDataList[idx]._source[selectFieldType[0]].value,
      }));

      setChartData(dataList);
    }

    // table

    setTableData(tableDataList.reverse());
  };

  // 쿼리데이터가 비지 않았을 때만 서치 함수 실행
  useEffect(() => {
    if (queryData.length !== 0) search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryData]);

  return (
    <div className="main">
      {loading ? "Loading" : null}
      {/* 검색을 위한 옵션 설정 칸 */}
      <div className="main-options">
        <div className="main-options-type">
          {/* group id 옵션 */}
          <div className="main-options-title">Group Id</div>
          <div className="main-options-select">
            <select
              name="group-id"
              id="group-id"
              onChange={(e) => setGroupId(e.target.value)}
            >
              {groupIdList.map((e, i) => (
                <option value={e} key={i}>
                  {e}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="main-options-type">
          {/* data type 옵션 */}
          <div className="main-options-title">Data Type</div>
          <div className="main-options-select">
            <select
              name="data-type"
              id="data-type"
              onChange={(e) => {
                setSelectType(e.target.value);
                setChartData([]);
                setTableData([]);
              }}
            >
              {data.map((e, i) => (
                <option value={e.type} key={i}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="main-options-field">
          {/* data field 옵션 */}
          <div className="main-options-title">Data Field</div>
          <div className="main-options-select">
            <select
              name="data-field"
              id="data-field"
              onChange={(e) => {
                setSelectField(e.target.value);
                setChartData([]);
                setTableData([]);
              }}
            >
              {field.map((e, i) => (
                <option value={e.type} key={i}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="main-options-datepicker">
          {/* 검색 시간 범위 설정 */}
          <div className="main-options-title">Created Time</div>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <Grid container justifyContent="space-between">
              <KeyboardDatePicker
                disableToolbar
                variant="inline"
                format="yyyy-MM-dd"
                margin="normal"
                id="date-picker-start"
                label="Start Date"
                value={startDate}
                onChange={handleStartDateChange}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
              />
              <KeyboardTimePicker
                margin="normal"
                id="time-picker-start"
                label="Start Time"
                value={startDate}
                onChange={handleStartDateChange}
                KeyboardButtonProps={{
                  "aria-label": "change time",
                }}
              />
            </Grid>
            <Grid container justifyContent="space-between">
              <KeyboardDatePicker
                disableToolbar
                variant="inline"
                format="yyyy-MM-dd"
                margin="normal"
                id="date-picker-end"
                label="End Date"
                value={endDate}
                onChange={handleEndDateChange}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
              />
              <KeyboardTimePicker
                margin="normal"
                id="time-picker-end"
                label="End Time"
                value={endDate}
                onChange={handleEndDateChange}
                KeyboardButtonProps={{
                  "aria-label": "change time",
                }}
              />
            </Grid>
          </MuiPickersUtilsProvider>
        </div>
      </div>
      {/* 검색 버튼 */}
      <div className="main-search">
        <button onClick={() => getQueryData()}>Search</button>
      </div>
      {/* 결과 그래프 화면 */}
      <div className="main-graph">
        <div className="main-graph-title">Graph</div>
        {
          // human information, 체온온도습도, 걸음수이동거리는 다중 그래프
          selectType === "human information" ||
          (selectType === "humanactivity" &&
            selectFieldType[0] === "bodytemp") ||
          (selectType === "humanactivity" && selectFieldType[0] === "step") ? (
            <Line
              data={h_chartData}
              options={{
                animation: {
                  duration: 0,
                },
                scales: {
                  y1: {
                    type: "linear",
                    display: true,
                    position: "left",
                    ticks: {
                      beginAtZero: true,
                    },
                  },
                  y2: {
                    type: "linear",
                    display: true,
                    position: "right",
                    ticks: {
                      beginAtZero: true,
                    },
                    grid: {
                      drawOnChartArea: false,
                    },
                  },
                },
                spanGaps: true,
              }}
            />
          ) : // gps 경우 그래프 대신 맵을 보여줌
          selectFieldType[0] === "gps" ? (
            <Map marker={chartData} />
          ) : (
            // 위의 예외 경우를 제외한 다른 검색 경우는 그래프 하나를 보여줌
            <Line
              data={{
                labels: chartLabel ? chartLabel : null,
                datasets: [
                  {
                    label: selectFieldType[0],
                    data: chartData,
                    lineTension: 0,
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    borderColor: "rgb(255, 99, 132)",
                    borderWidth: 3,
                    yAxisId: "y1",
                  },
                ],
              }}
              options={{
                animation: {
                  duration: 0,
                },
                spanGaps: true,
              }}
            />
          )
        }
      </div>
      {/* 결과 테이블 화면 */}
      <div className="main-table">
        <div className="main-graph-title">Table</div>
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>날짜</TableCell>
                {selectType === "humanactivity" &&
                selectFieldType[0] === "bodytemp" ? (
                  <>
                    <TableCell>체온</TableCell>
                    <TableCell>온도</TableCell>
                    <TableCell>습도</TableCell>
                  </>
                ) : selectType === "humanactivity" &&
                  selectFieldType[0] === "step" ? (
                  <>
                    <TableCell>걸음 수</TableCell>
                    <TableCell>이동 거리</TableCell>
                  </>
                ) : (
                  <TableCell>{selectFieldType[0]}</TableCell>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {selectType === "humanactivity" &&
              selectFieldType[0] === "bodytemp"
                ? tableData.length > 0 &&
                  tableData.map((e, i) => (
                    <TableRow key={i}>
                      <TableCell>{e.date}</TableCell>
                      <TableCell>{e[selectFieldType[0]]}</TableCell>
                      <TableCell>{e[selectFieldType[1]]}</TableCell>
                      <TableCell>{e[selectFieldType[2]]}</TableCell>
                    </TableRow>
                  ))
                : selectType === "humanactivity" &&
                  selectFieldType[0] === "step"
                ? tableData.length > 0 &&
                  tableData.map((e, i) => (
                    <TableRow key={i}>
                      <TableCell>{e.date}</TableCell>
                      <TableCell>{e[selectFieldType[0]]}</TableCell>
                      <TableCell>{e[selectFieldType[1]]}</TableCell>
                    </TableRow>
                  ))
                : tableData.length > 0 &&
                  tableData.map((e, i) => (
                    <TableRow key={i}>
                      <TableCell>{e.date}</TableCell>
                      <TableCell>{e[selectFieldType[0]]}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default Main;



// human information || bodytemp || step 을 검색 할 시
// if (
//   selectType === "human information" ||
//   (selectType === "humanactivity" && selectFieldType[0] === "bodytemp") ||
//   (selectType === "humanactivity" && selectFieldType[0] === "step")
// ) {
//   var tableD = [];
//   console.log(selectType, selectFieldType);
//   // body temp 검색 시 (human activity > 체온 / 온도 / 습도)
//   if (selectFieldType[0] === "bodytemp") {
//     var bodytemp = [];
//     var temp = [];
//     var humi = [];
//     for (var h = 0; h < searchDataList.length; h++) {
//       var h_date = new Date(
//         searchDataList[h]._source.createdtime.replace(" ", "T")
//       );
//       if (!isNaN(h_date)) {
//         if (searchDataList[h]._source === undefined) {
//           continue;
//         } else {
//           var h_valueD1 = parseFloat(
//             searchDataList[h]._source["bodytemp"].value
//           );
//           var h_valueD2 = parseFloat(searchDataList[h]._source["temp"].value);
//           var h_valueD3 = parseFloat(searchDataList[h]._source["humi"].value);
//           var h_dateD = searchDataList[h]._source.createdtime;
//           bodytemp.push(h_valueD1);
//           temp.push(h_valueD2);
//           humi.push(h_valueD3);
//           dateList.push(h_dateD);
//           tableD.push({
//             date: h_dateD,
//             bodytemp: h_valueD1,
//             temp: h_valueD2,
//             humi: h_valueD3,
//           });
//         }
//       }
//     }
//     setHChartData({
//       labels: dateList,
//       datasets: [
//         {
//           label: "bodytemp",
//           data: bodytemp,
//           backgroundColor: "rgba(255, 99, 132, 0.2)",
//           borderColor: "rgb(255, 99, 132)",
//           borderWidth: 3,
//           yAxisID: "y1",
//         },
//         {
//           label: "temp",
//           data: temp,
//           backgroundColor: "rgba(54, 162, 235, 0.2)",
//           borderColor: "rgb(54, 162, 235)",
//           borderWidth: 3,
//           yAxisID: "y1",
//         },
//         {
//           label: "humidity",
//           data: humi,
//           backgroundColor: "rgba(201, 203, 207, 0.2)",
//           borderColor: "rgb(201, 203, 207)",
//           borderWidth: 3,
//           yAxisID: "y2",
//         },
//       ],
//     });
//   }
//   // step 검색 시 (human activity > 걸음수 / 이동거리)
//   else if (selectFieldType[0] === "step") {
//     var step = [];
//     var dist = [];
//     var sumStep = 0;
//     var sumDist = 0;
//     for (var s = 0; s < searchDataList.length; s++) {
//       var s_date = new Date(
//         searchDataList[s]._source.createdtime.replace(" ", "T")
//       );
//       if (!isNaN(s_date)) {
//         if (searchDataList[s]._source === undefined) continue;
//         else {
//           var s_valueD1 = parseFloat(searchDataList[s]._source["step"].value);
//           var s_valueD2 = parseFloat(
//             searchDataList[s]._source["distance"].value
//           );
//           var s_dateD = searchDataList[s]._source.createdtime;
//           sumStep += s_valueD1;
//           sumDist += s_valueD2;
//           step.push(s_valueD1);
//           dist.push(s_valueD2);
//           dateList.push(s_dateD);
//           tableD.push({
//             date: s_dateD,
//             step: s_valueD1,
//             dist: s_valueD2,
//           });
//         }
//       }
//     }
//     var startStepTime = new Date(tableD[0].date);
//     var endStepTime = new Date(tableD[tableD.length - 1].date);
//     var stepTime = endStepTime.getTime() - startStepTime.getTime();
//     var stepHour = parseInt(stepTime / 1000 / 60 / 60);
//     var stepMin = parseInt((stepTime - stepHour * 1000 * 60 * 60) / 1000 / 60);
//     var stepSec = parseInt(
//       (stepTime - stepHour * 1000 * 60 * 60 - stepMin * 1000 * 60) / 1000
//     );

//     setStepTableData({
//       step_hour: stepHour,
//       step_min: stepMin,
//       step_sec: stepSec,
//       sumStep,
//       sumDist,
//     });
//     setHChartData({
//       labels: dateList,
//       datasets: [
//         {
//           label: "step",
//           data: step,
//           backgroundColor: "rgba(255, 99, 132, 0.2)",
//           borderColor: "rgb(255, 99, 132)",
//           borderWidth: 3,
//           yAxisID: "y1",
//         },
//         {
//           label: "distance",
//           data: dist,
//           backgroundColor: "rgba(54, 162, 235, 0.2)",
//           borderColor: "rgb(54, 162, 235)",
//           borderWidth: 3,
//           yAxisID: "y2",
//         },
//       ],
//     });
//   }
//   //human information 검색시
//   else if (selectType === "human information") {
//     var hi_bodytemp = [];
//     var hi_temp = [];
//     var hi_hba1c = [];
//     var hi_step = [];
//     var hi_dist = [];
//     var hi_co2 = [];
//     var hi_co2_10 = [];
//     var hi_hr = [];
//     var hi_humidity = [];
//     var hi_spo2 = [];
//     for (var hi = 0; hi < searchDataList.length; hi++) {
//       var hi_date = new Date(
//         searchDataList[hi]._source.createdtime.replace(" ", "T")
//       );
//       if (!isNaN(hi_date)) {
//         if (searchDataList[hi]._source === undefined) continue;
//         else {
//           var hi_dateD = searchDataList[hi]._source.createdtime;
//           dateList.push(hi_dateD);

//           var hi_bodytemp_value = null;
//           var hi_temp_value = null;
//           var hi_humidity_value = null;
//           var hi_step_value = null;
//           var hi_dist_value = null;
//           var hi_co2_value = null;
//           var hi_hr_value = null;
//           var hi_hba1c_value = null;
//           var hi_spo2_value = null;
//           if (searchDataList[hi]._index === "oximetry") {
//             hi_hr_value = parseFloat(
//               searchDataList[hi]._source["hr"]
//                 ? searchDataList[hi]._source["hr"].value
//                 : 0
//             );
//             hi_hba1c_value = parseFloat(
//               searchDataList[hi]._source["hba1c"].value
//             );
//             hi_spo2_value = parseFloat(
//               searchDataList[hi]._source["spo2"].value
//             );
//           }
//           if (searchDataList[hi]._index === "humidity") {
//             hi_bodytemp_value = parseFloat(
//               searchDataList[hi]._source["bodytemp"].value
//             );
//             hi_temp_value = parseFloat(
//               searchDataList[hi]._source["temp"].value
//             );
//             hi_humidity_value = parseFloat(
//               searchDataList[hi]._source["humidity"].value
//             );
//             hi_step_value = parseFloat(
//               searchDataList[hi]._source["step"].value
//             );
//             hi_dist_value = parseFloat(
//               searchDataList[hi]._source["distance"].value
//             );
//             hi_co2_value = parseFloat(searchDataList[hi]._source["co2"].value);
//           }
//           hi_hr.push(hi_hr_value);
//           hi_hba1c.push(hi_hba1c_value);
//           hi_spo2.push(hi_spo2_value);
//           hi_bodytemp.push(hi_bodytemp_value);
//           hi_temp.push(hi_temp_value);
//           hi_humidity.push(hi_humidity_value);
//           hi_step.push(hi_step_value);
//           hi_dist.push(hi_dist_value);
//           hi_co2.push(hi_co2_value);
//           hi_co2_10.push(hi_co2_value ? hi_co2_value / 10 : null);
//           tableD.push({
//             date: hi_dateD,
//             bodytemp: hi_bodytemp_value,
//             temp: hi_temp_value,
//             humidity: hi_humidity_value,
//             step: hi_step_value,
//             distance: hi_dist_value,
//             co2: hi_co2_value,
//             hr: hi_hr_value,
//             hba1c: hi_hba1c_value,
//             spo2: hi_spo2_value,
//           });
//         }
//       }
//     }
//     setHChartData({
//       labels: dateList,
//       datasets: [
//         {
//           label: "bodytemp",
//           data: hi_bodytemp,
//           backgroundColor: "rgba(255, 99, 132, 0.2)",
//           borderColor: "rgb(255, 99, 132)",
//           borderWidth: 3,
//           yAxisID: "y1",
//         },
//         {
//           label: "temp",
//           data: hi_temp,
//           backgroundColor: "rgba(55, 160, 192, 0.2)",
//           borderColor: "rgb(55, 160, 192)",
//           borderWidth: 3,
//           yAxisID: "y1",
//         },
//         {
//           label: "hba1c",
//           data: hi_hba1c,
//           backgroundColor: "rgba(255, 205, 86, 0.2)",
//           borderColor: "rgb(255, 205, 86)",
//           borderWidth: 3,
//           yAxisID: "y1",
//         },
//         {
//           label: "step",
//           data: hi_step,
//           backgroundColor: "rgba(75, 192, 192, 0.2)",
//           borderColor: "rgb(54, 162, 235)",
//           borderWidth: 3,
//           yAxisID: "y2",
//         },
//         {
//           label: "distance",
//           data: hi_dist,
//           backgroundColor: "rgba(153, 102, 255, 0.2)",
//           borderColor: "rgb(153, 102, 255)",
//           borderWidth: 3,
//           yAxisID: "y2",
//         },
//         {
//           label: "co2",
//           data: hi_co2_10,
//           backgroundColor: "rgba(201, 203, 207, 0.2)",
//           borderColor: "rgb(201, 203, 207)",
//           borderWidth: 3,
//           yAxisID: "y2",
//         },
//         {
//           label: "heart_rate",
//           data: hi_hr,
//           backgroundColor: "rgba(75, 192, 192, 0.2)",
//           borderColor: "rgb(75, 192, 192)",
//           borderWidth: 3,
//           yAxisID: "y2",
//         },
//         {
//           label: "humidity",
//           data: hi_humidity,
//           backgroundColor: "rgba(255, 159, 64, 0.2)",
//           borderColor: "rgb(255, 159, 64)",
//           borderWidth: 3,
//           yAxisID: "y2",
//         },
//         {
//           label: "spO2",
//           data: hi_spo2,
//           backgroundColor: "rgba(0, 0, 0, 0.2)",
//           borderColor: "rgb(128, 128, 128)",
//           borderWidth: 3,
//           yAxisID: "y2",
//         },
//       ],
//     });
//   }
//   console.log(tableD);
//   setHTableData(tableD);
// }
// // 위의 세 경우를 제외하고 나머지 검색 시
// else {
//   for (var j = 0; j < searchDataList.length; j++) {
//     var date = new Date(
//       searchDataList[j]._source.createdtime.replace(" ", "T")
//     );
//     if (!isNaN(date)) {
//       if (searchDataList[j]._source[selectFieldType[0]] === undefined) continue;
//       else {
//         var valueD = 0;
//         if (selectFieldType[0] === "gps") {
//           valueD = searchDataList[j]._source[selectFieldType[0]];
//         } else
//           valueD = parseFloat(
//             searchDataList[j]._source[selectFieldType[0]].value
//           );
//         console.log(selectFieldType[0], searchDataList[j]._source.createdtime);
//         var dateD = searchDataList[j]._source.createdtime;
//         // var dateD = searchDataList[j]._source.createdtime;
//         dataList.push(valueD);
//         dateList.push(dateD);
//         tableDataList.push({
//           date: dateD,
//           value: valueD,
//         });
//       }
//     }
//     setTableData(tableDataList.reverse());
//     setChartData(dataList.reverse());
//     setChartLabel(dateList);
//   }
// }



//         // {
//         //   // human information, 체온온도습도, 걸음수이동거리는 다중 테이블
//         //   (selectType === "humanactivity" &&
//         //     selectFieldType[0] === "bodytemp") ||
//         //   (selectType === "athietics" && selectFieldType[0] === "step") ? (
//         //     <TableContainer component={Paper}>
//         //       <Table aria-label="simple table">
//         //         <TableHead>
//         //           {selectFieldType[0] === "bodytemp" ? (
//         //             <TableRow>
//         //               <TableCell>날짜</TableCell>
//         //               <TableCell>체온</TableCell>
//         //               <TableCell>온도</TableCell>
//         //               <TableCell>습도</TableCell>
//         //             </TableRow>
//         //           ) : (
//         //             <TableRow>
//         //               <TableCell>날짜</TableCell>
//         //               <TableCell>걸음 수</TableCell>
//         //               <TableCell>이동 거리</TableCell>
//         //             </TableRow>
//         //           )}
//         //         </TableHead>
//         //         <TableBody>
//         //           {selectFieldType[0] === "bodytemp"
//         //             ? h_tableData.map((e, i) => (
//         //                 <TableRow key={i}>
//         //                   <TableCell>{e.date}</TableCell>
//         //                   <TableCell>{e.bodytemp}</TableCell>
//         //                   <TableCell>{e.temp}</TableCell>
//         //                   <TableCell>{e.humi}</TableCell>
//         //                 </TableRow>
//         //               ))
//         //             : h_tableData.map((e, i) => (
//         //                 <TableRow key={i}>
//         //                   <TableCell>{e.date}</TableCell>
//         //                   <TableCell>{e.step}</TableCell>
//         //                   <TableCell>{e.dist}</TableCell>
//         //                 </TableRow>
//         //               ))}
//         //           {selectFieldType[0] === "step" ? (
//         //             <TableRow>
//         //               <TableCell>
//         //                 총 {stepTableData.step_hour}시간{" "}
//         //                 {stepTableData.step_min}분 {stepTableData.step_sec}초
//         //               </TableCell>
//         //               <TableCell>{stepTableData.sumStep} 걸음</TableCell>
//         //               <TableCell>{stepTableData.sumDist} m</TableCell>
//         //             </TableRow>
//         //           ) : null}
//         //         </TableBody>
//         //       </Table>
//         //     </TableContainer>
//         //   ) : selectType === "human information" ? (
//         //     <TableContainer component={Paper}>
//         //       <Table aria-label="simple table">
//         //         <TableHead>
//         //           <TableRow>
//         //             <TableCell>날짜</TableCell>
//         //             <TableCell>체온</TableCell>
//         //             <TableCell>온도</TableCell>
//         //             <TableCell>습도</TableCell>
//         //             <TableCell>걸음 수</TableCell>
//         //             <TableCell>이동 거리</TableCell>
//         //             <TableCell>CO2</TableCell>
//         //             <TableCell>당화혈색소</TableCell>
//         //             <TableCell>심박</TableCell>
//         //             <TableCell>산소포화도</TableCell>
//         //           </TableRow>
//         //         </TableHead>
//         //         <TableBody>
//         //           {h_tableData.length > 0 &&
//         //             h_tableData.map((e, i) => (
//         //               <TableRow key={i}>
//         //                 <TableCell>{e.date}</TableCell>
//         //                 <TableCell>{e.bodytemp}</TableCell>
//         //                 <TableCell>{e.temp}</TableCell>
//         //                 <TableCell>{e.humidity}</TableCell>
//         //                 <TableCell>{e.step}</TableCell>
//         //                 <TableCell>{e.distance}</TableCell>
//         //                 <TableCell>{e.co2}</TableCell>
//         //                 <TableCell>{e.hba1c}</TableCell>
//         //                 <TableCell>{e.hr}</TableCell>
//         //                 <TableCell>{e.spo2}</TableCell>
//         //               </TableRow>
//         //             ))}
//         //         </TableBody>
//         //       </Table>
//         //     </TableContainer>
//         //   ) : (
//         //     <TableContainer component={Paper}>
//         //       <Table aria-label="simple table">
//         //         <TableHead>
//         //           <TableRow>
//         //             <TableCell>날짜</TableCell>

//         //             {selectFieldType[0] === "hba1c" ? (
//         //               <TableCell>당화혈색소</TableCell>
//         //             ) : selectFieldType[0] === "hr" ? (
//         //               <TableCell>심박</TableCell>
//         //             ) : selectFieldType[0] === "spo2" ? (
//         //               <TableCell>산소포화도</TableCell>
//         //             ) : selectFieldType[0] === "gps" ? (
//         //               <TableCell>GPS</TableCell>
//         //             ) : selectFieldType[0] === "co2" ? (
//         //               <TableCell>이산화탄소</TableCell>
//         //             ) : selectFieldType[0] === "co" ? (
//         //               <TableCell>일산화탄소</TableCell>
//         //             ) : selectFieldType[0] === "no2" ? (
//         //               <TableCell>이산화질소</TableCell>
//         //             ) : selectFieldType[0] === "c2h5oh" ? (
//         //               <TableCell>에탄올</TableCell>
//         //             ) : selectFieldType[0] === "h2" ? (
//         //               <TableCell>수소</TableCell>
//         //             ) : selectFieldType[0] === "nh3" ? (
//         //               <TableCell>암모니아</TableCell>
//         //             ) : selectFieldType[0] === "ch4" ? (
//         //               <TableCell>메탄</TableCell>
//         //             ) : selectFieldType[0] === "c3h8" ? (
//         //               <TableCell>프로판</TableCell>
//         //             ) : selectFieldType[0] === "c4h10" ? (
//         //               <TableCell>이소부탄</TableCell>
//         //             ) : selectFieldType[0] === "temp" ? (
//         //               <TableCell>온도</TableCell>
//         //             ) : selectFieldType[0] === "humidity" ? (
//         //               <TableCell>습도</TableCell>
//         //             ) : selectFieldType[0] === "barometer" ? (
//         //               <TableCell>기압</TableCell>
//         //             ) : (
//         //               <TableCell>주변인 인식</TableCell>
//         //             )}
//         //           </TableRow>
//         //         </TableHead>
//         //         <TableBody>
//         //           {tableData.length > 0 &&
//         //             tableData.map((e, i) => (
//         //               <TableRow key={i}>
//         //                 <TableCell>{e.date}</TableCell>
//         //                 <TableCell>{e.value}</TableCell>
//         //               </TableRow>
//         //             ))}
//         //         </TableBody>
//         //       </Table>
//         //     </TableContainer>
//         //   )
//         // }