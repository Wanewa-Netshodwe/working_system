import React, { useEffect, useState } from "react";
import SideMenuBar from "../components/SideMenuBar";
import GraphItem from "../components/GraphItem";
import Clock from "react-clock";
import {
  faRightToBracket,
  faRightFromBracket,
  faL,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import GraphItemHours from "../components/GraphItemHours";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import "react-day-picker/style.css";
import "../components/clock.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "reactjs-popup/dist/index.css";
import { setAppDetails } from "../redux/appSlice";
import { increment, startTimer } from "../redux/timerSlice";
import { setClockin, setUserDetails, UserState } from "../redux/UserSlice";
import axios from "axios";
import {
  AttendanceData,
  setAttendanceData,
  setAttendanceDataDaily,
} from "../redux/AttendanceSlice";
import {
  Analytics,
  AnalyticsWithComparison,
  calculateDashBoardAnalyticDaily,
} from "../utils/Analytics";
import DashboardLoader from "../components/DashboardLoader";
type Props = {};

export default function Dashboard({}: Props) {
  const dispatch = useDispatch();
  const [flag, setFlag] = useState(false);
  const usr = useSelector((state: RootState) => state.user);
  console.log(" user data in main log in  " +JSON.stringify(usr))
  const my_attendance_data_daily = useSelector(
    (state: RootState) => state.attendance_data.my_attendance_data_daily
  );

  const { time, running } = useSelector((state: RootState) => state.timer);
  useEffect(() => {
    let interval: NodeJS.Timer;
    if (running) {
      interval = setInterval(() => {
        dispatch(increment());
      }, 1000);
    } else {
      //@ts-ignore
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [running, dispatch]);

  const defaultClassNames = getDefaultClassNames();
  const [value, setValue] = useState(new Date());
  const [blocked, setBlocked] = useState(false);
  const [totalSeconds, setTotalseconds] = useState(0);
  const [analyticData, setAnalyticData] = useState<Analytics | undefined>();
  const [attendance_data_d, Setattendance_data_d] = useState<
    Map<string, AttendanceData>
  >(new Map());
  const [dataMap, setDataMap] = useState<Map<string, AttendanceData[]>>(
    new Map()
  );

  useEffect(() => {
    setTimeout(() => {
      setBlocked(false);
    }, 6000);
  }, [blocked]);
  const handelBtnPress = async () => {
    if (clocked_in) {
      dispatch(setAppDetails(true));
    } else {
      try {
        const result = await axios.post(
          "http://localhost:8092/api/clockin",
          usr
        );
        console.log(result.status);
        if (blocked) {
        } else {
          dispatch(startTimer());
          dispatch(setClockin(true));
        }
      } catch (err) {
        if (axios.isAxiosError(err))
          if (err.response?.status === 403) {
            setBlocked(true);
          }
      }
    }
  };
  const isopen = useSelector(
    (state: RootState) => state.app.clock_out_modal_open
  );
  const [executed, setExecuted] = useState(false);
  const clocked_in = useSelector((state: RootState) => state.user.clocked_in);

  useEffect(() => {
    const interval = setInterval(() => setValue(new Date()), 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const fetchData = async () => {
    let obj = {
      fullName: usr.fullName,
      surname: usr.surname,
      contactNo: usr.contactNo,
      emailAddress: usr.emailAddress,
      studentNumber: usr.studentNumber,
      gender: usr.gender,
      password: usr.password,
    };
    console.log("the object " + JSON.stringify(obj));

    await get_data(obj);
  };

  const get_data = async (obj: {
    fullName: string;
    surname: string;
    contactNo: string;
    emailAddress: string;
    studentNumber: string;
    gender: string;
    password: string;
  }) => {
    try {
      const result = await axios.post(
        "http://localhost:8092/api/attendance",
        obj
      );
      if (result.status === 200) {
        let attendance_data_array: AttendanceData[] = [];
        let data_map: Map<string, AttendanceData[]> = new Map();
        let data_map_daily: Map<string, AttendanceData> = new Map();
        result.data.map((data: any) => {
          attendance_data_array.push({
            clock_in: new Date(data.clock_in),
            clock_out: new Date(data.clock_out),
            todayDate: new Date(data.todayDate),
            valid: data.valid,
            workHours:{
              hours:data.workHours.hours,
              minutes:data.workHours.minutes,
              seconds:data.workHours.seconds
            }
          });
          const year = new Date(data.todayDate).getFullYear();
          const month = String(
            new Date(data.todayDate).getMonth() + 1
          ).padStart(2, "0");
          const day = String(new Date(data.todayDate).getDate()).padStart(
            2,
            "0"
          );
          data_map.set(`${year}-${month}`, attendance_data_array);
          data_map_daily.set(`${year}-${month}-${day}`, {
            clock_in: new Date(data.clock_in),
            clock_out: new Date(data.clock_out),
            todayDate: new Date(data.todayDate),
            valid: true,
            workHours:{
              hours:data.workHours.hours,
              minutes:data.workHours.minutes,
              seconds:data.workHours.seconds
            },
          });
        });
        Setattendance_data_d(new Map(data_map_daily));
        setDataMap(new Map(data_map));
      }
    } catch (err) {
      console.log(err);
    }
  };
  console.log(
    "my attendance daily : " + JSON.stringify(my_attendance_data_daily)
  );
  useEffect(() => {
    console.log(
      "Updated daily attendance from the store root :",
      my_attendance_data_daily
    );
    setFlag(!flag);
    if (my_attendance_data_daily.size <= 0) {
      console.log("im fetching data: coz  my_attendance_data_daily is empty ");
      fetchData();
    } else {
      console.log("calculating analityiics ");
      const data_anaytics = calculateDashBoardAnalyticDaily(
        new Map(my_attendance_data_daily)
      );
      console.log(
        "called calculateDashBoardAnalyticDaily with input : " +
          new Map(my_attendance_data_daily)
      );
      console.log("analytic data :  " + data_anaytics);
      console.log("setting up analytics");
      setAnalyticData(data_anaytics);
      console.log("finish ed setting up analytics");
    }
  }, [my_attendance_data_daily]);

  type ValuePiece = Date | null;
  function isAnalyticsWithComparison(
    analytics: Analytics
  ): analytics is AnalyticsWithComparison {
    return "compare" in analytics;
  }
  type Value = ValuePiece | [ValuePiece, ValuePiece];
  const [value2, onChange] = useState<Value>(new Date());
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  console.log(analyticData);
  console.log(usr.new_account);
  useEffect(() => {
    console.log("Updated usestate attendance_data_d :", attendance_data_d);
    if (attendance_data_d.size > 0) {
      dispatch(setAttendanceData(dataMap));
      dispatch(setAttendanceDataDaily(attendance_data_d));
    }
  }, [attendance_data_d]);

  useEffect(() => {
    console.log("Updated usestate analyticData :", analyticData);
    if (analyticData !== undefined) {
      const totalSeconds = isAnalyticsWithComparison(analyticData)
        ? analyticData.compare.working_hours.hours * 3600 +
          analyticData.compare.working_hours.minutes * 60 +
          analyticData.compare.working_hours.seconds
        : analyticData.working_hours.hours * 3600 +
          analyticData.working_hours.minutes * 60 +
          analyticData.working_hours.seconds;
      setTotalseconds(totalSeconds);
    }
  }, [analyticData]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     setFlag(!flag);
  //   }, 1000);
  //   console.log("updating flag");
  // }, [flag]);

  console.log("daily attendace : " + JSON.stringify(attendance_data_d));

  return (
    <div>
      {analyticData !== undefined || usr.new_account ? (
        <div
          className={`w-[100vw] ${
            isopen && "blur-sm"
          } z-10 h-[120%] flex  bg-[#F3F8FB]  border-2`}
        >
          <SideMenuBar current="Dashboard" />

          <div className="border-2 p-5 w-full flex-2 ">
            <div className="flex justify-between w-[95%]">
              <p className="font-poppins text-[20px] font-semibold mb-5  ">
                insights
              </p>
              <div>
                <select
                  className=" w-[70px]  text-[#393f45] focus:outline-none pl-2 border-1  h-[30px] border-l-2
             border-t-2  border-b-2 rounded-tl-md rounded-bl-md
             font-poppins text-[14px]
             border-[#a4c3e3]"
                >
                  <option className="font-poppins ">2025</option>
                </select>
                <select
                  className=" w-[120px] 
             
             border-r-2 rounded-tr-md rounded-br-md
             border-t-2  border-b-2 font-poppins text-[14px]
             text-[#576069] focus:outline-none pl-4  h-[30px] border-1  border-[#a4c3e3]"
                >
                  <option className="font-poppins ">March</option>
                </select>
              </div>
            </div>

            <div className="p-2 flex flex-wrap gap-5">
              <GraphItem
                change={
                  analyticData
                    ? isAnalyticsWithComparison(analyticData)
                      ? analyticData.changes.ontime_perc_change
                      : 0
                    : 0
                }
                dataValues={
                  analyticData
                    ? isAnalyticsWithComparison(analyticData)
                      ? analyticData.compare.datasets.ontime
                      : analyticData.datasets.ontime
                    : []
                }
                borderColor="#52B623"
                color="#CDFF8C"
                month="February"
                //@ts-ignore
                perc={`${
                  analyticData
                    ? isAnalyticsWithComparison(analyticData)
                      ? analyticData.compare.ontime_perc
                      : analyticData.ontime_perc
                    : "0"
                } %`}
                title="On Time Percentage"
              />
              <GraphItem
                change={
                  analyticData
                    ? isAnalyticsWithComparison(analyticData)
                      ? analyticData.changes.late_perc_change
                      : 0
                    : 0
                }
                dataValues={
                  analyticData
                    ? isAnalyticsWithComparison(analyticData)
                      ? analyticData.compare.datasets.late
                      : analyticData.datasets.late
                    : []
                }
                borderColor="#F5533D"
                color="#FF9C8E"
                month="February"
                perc={`${
                  analyticData
                    ? isAnalyticsWithComparison(analyticData)
                      ? analyticData.compare.late_perc
                      : analyticData.late_perc
                    : "0"
                } %`}
                title="Late Percentage"
              />
              <GraphItemHours
                change={
                  analyticData
                    ? isAnalyticsWithComparison(analyticData)
                      ? analyticData.changes.lunch_hours_change
                      : 0
                    : 0
                }
                dataValues={
                  analyticData
                    ? isAnalyticsWithComparison(analyticData)
                      ? analyticData.compare.datasets.lunch
                      : analyticData.datasets.lunch
                    : []
                }
                borderColor="#FF7A00"
                color="#FFB37F"
                month="February"
                hour={`${
                  analyticData
                    ? isAnalyticsWithComparison(analyticData)
                      ? analyticData.compare.lunch_hours
                      : analyticData.lunch_hours
                    : "0"
                }`}
                minutes={"0"}
                seconds="0"
                perc="0"
                title="Total Lunch Hours"
              />
              <GraphItemHours
                change={
                  analyticData
                    ? isAnalyticsWithComparison(analyticData)
                      ? analyticData.changes.working_hours_change.hours
                      : 0
                    : 0
                }
                dataValues={
                  analyticData
                    ? isAnalyticsWithComparison(analyticData)
                      ? analyticData.compare.datasets.work
                      : analyticData.datasets.work
                    : []
                }
                borderColor="#00BAC8"
                color="#02DEEE"
                month="February"
                hour={`${Math.floor(totalSeconds / 3600)}`}
                minutes={`${Math.floor((totalSeconds % 3600) / 60)-minutes  < 0 ? Math.abs(Math.floor((totalSeconds % 3600) / 60)-minutes) :Math.floor((totalSeconds % 3600) / 60)-minutes }`}
                seconds={`${totalSeconds % 60}`}
                perc="35%"
                title="Total Working Hours"
              />
            </div>
            {/* <p className="font-poppins text-[20px] font-semibold mt-3 mb-4 ">
           Announcements
           <span className="font-poppins text-[11px] font-light ">
             {" "}
             Messages will disappear after 24 Hours
           </span>
         </p>
         <Annoucements /> */}
            <p className="font-poppins text-[20px] font-semibold mt-3 mb-4 ">
              Attendance
            </p>

            <div className=" flex gap-3">
              <div className="bg-white p-1 w-[360px] border-2 border-[#C6E6FB] rounded-md">
                <DayPicker
                  hideNavigation
                  captionLayout="label"
                  mode="single"
                  timeZone="Africa/Johannesburg"
                  classNames={{
                    month_caption:
                      " font-poppins text-[20px] text-center mb-4 font-semibold text-[#2C5B8C]",
                    weekday: "text-[#83ACD8]",
                    day: "font-poppins font-semibold",
                    today: `text-[#83ACD8]`, 
                    selected: ` border-2 border-[#83ACD8] text-[#2C5B8C]`,
                    root: `${defaultClassNames.root} shadow-lg p-5`,
                    chevron: `${defaultClassNames.chevron} fill-amber-500`,
                  }}
                />
              </div>
              <div className="bg-white flex p-1 w-[860px] border-2 border-[#C6E6FB]  rounded-md">
                <div className="flex-row w-[300px] items-center  mt-10">
                  <div className="">
                    <Clock
                      secondHandWidth={2}
                      hourHandWidth={2}
                      minuteHandWidth={1}
                      renderMinuteMarks={false}
                      size={200}
                      value={value}
                    />
                  </div>
                  <div>
                    <p className="font-poppins text-[35px] mt-4 text-center font-semibold text-[#2C5B8C]">
                      {String(value.getHours()).padStart(2, "0")} :{" "}
                      {String(value.getMinutes()).padStart(2, "0")}:{" "}
                      {String(value.getSeconds()).padStart(2, "0")}
                    </p>
                  </div>
                </div>

                <div className="mt-10">
                  <div className="flex gap-3">
                    <div>
                      <div className="w-[250px] border-2 p-3 border-[#C6E6FB] h-[85px]  rounded-md mb-4">
                        <p className="font-poppins font-semibold mb-1">
                          Working Hours{" "}
                        </p>
                        <p className="font-poppins  text-[#2C5B8C] text-[21px] font-semibold">
                          {`${hours}`} Hr {`${minutes}`} Mins {`${seconds}`}{" "}
                          Secs
                        </p>
                      </div>
                      <div className="w-[250px] border-2 p-3 border-[#C6E6FB] h-[85px]  rounded-md">
                        <p className="font-poppins font-semibold mb-1">
                          Lunch Hours{" "}
                        </p>
                        <p className="font-poppins  text-[#2C5B8C] text-[21px] font-semibold">
                          1 Hr 00 Mins 00 Secs{" "}
                        </p>
                      </div>
                      <div></div>
                    </div>
                    <div>
                      <div className="border-2 p-3 flex flex-col justify-center items-center border-[#C6E6FB] rounded-md">
                        <img
                          src="/pot.png"
                          alt="pot pic"
                          className=" w-[139px] h-[139px] from-[#cc4b4b]"
                        />
                        <p className="font-poppins text-[#66B602] text-[13px] text-center font-semibold">
                          Lost time is never found again
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 flex gap-6 items-center mt-8">
                    <div>
                      <FontAwesomeIcon
                        icon={
                          clocked_in ? faRightFromBracket : faRightToBracket
                        }
                        size="2x"
                        color={`${clocked_in ? "#cc4b4b" : "#52B623"}`}
                      />
                    </div>
                    <div>
                      <button
                        onClick={handelBtnPress}
                        className={`font-poppins ${
                          clocked_in
                            ? " bg-gradient-to-r  from-[#d54d4d] via-[#b60232] to-[#d14545] "
                            : " bg-gradient-to-r  from-[#52B623] via-[#66B602] to-[#94D145]"
                        } rounded-md text-white p-1 w-[450px] text-[19px] font-semibold `}
                      >
                        {clocked_in ? "clock-out" : "clock-in"}
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    {blocked && (
                      <p className="font-poppins font-semibold text-[14px] text-[#d54d4d]">
                        already clocked_in for today try tommorow
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <DashboardLoader />
      )}
    </div>
  );
}
