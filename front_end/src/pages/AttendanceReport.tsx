import React, { useEffect, useState } from "react";
import SideMenuBar from "../components/SideMenuBar";
import GraphItem from "../components/GraphItem";
import Clock from "react-clock";
import {
  faRightToBracket,
  faSearch,
  faFileExport,
  faRightLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { DayPicker, getDefaultClassNames } from "react-day-picker";
import "react-day-picker/style.css";
import "../components/clock.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { data } from "react-router-dom";
import {
  AttendanceData,
  setAttendanceData,
  setAttendanceDataDaily,
} from "../redux/AttendanceSlice";
import { increment } from "../redux/timerSlice";
import { useAttendanceAnalytics } from "../utils/CalculateAnalytic";

type Props = {};

export default function AttendanceReport({}: Props) {
  const dispatch = useDispatch();
  const defaultClassNames = getDefaultClassNames();
  const [value, setValue] = useState(new Date());
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  console.log("from Date : " + fromDate);
  console.log("to Date : " + toDate);
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
  const attendance_data = useSelector(
    (state: RootState) => state.attendance_data.my_attendance_data
  );
  const my_attendance_data_daily = useSelector(
    (state: RootState) => state.attendance_data.my_attendance_data_daily
  );
  const user = useSelector((state: RootState) => state.user);
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
            workHours: data.workHours,
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
          data_map_daily.set(`${year}-${month}-${day}`, data);
        });
        dispatch(setAttendanceData(data_map));
        dispatch(setAttendanceDataDaily(data_map_daily));
      }
    } catch (err) {
      console.log(err);
    }
  };
  const [attendance_array, setAttendanceArray] = useState<AttendanceData[]>([]);

  useEffect(() => {
    if (attendance_data.size > 0) {
      if (current_rows.length > 0) {
      } else {
        let temp_array: AttendanceData[][] = [];
        attendance_data.forEach((v, k) => {
          temp_array.push(v);
        });
        const flat_array = temp_array.flatMap((data) => data);
        setAttendanceArray(flat_array);
      }
    } else {
      let obj = {
        fullName: user.fullName,
        surname: user.surname,
        contactNo: user.contactNo,
        emailAddress: user.emailAddress,
        studentNumber: user.studentNumber,
        gender: user.gender,
        password: user.password,
      };
      get_data(obj);
    }
  }, []);

  useEffect(() => {
    const idx_last = currentPage * items_per_page;
    const first_index = idx_last - items_per_page;
    setCurrent_Rows(attendance_array.slice(first_index, idx_last));
  }, [attendance_array]);

  const [currentPage, setCurrentPage] = useState(1);
  const items_per_page = 8;
  const pages_i = Math.round(data.length / items_per_page);
  const pages = Array.from({ length: pages_i }).fill(1);
  const idx_last = currentPage * items_per_page;
  const first_index = idx_last - items_per_page;
  const [current_rows, setCurrent_Rows] = useState(
    attendance_array.slice(first_index, idx_last)
  );

  const handleFromDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFromDate(new Date(event.target.value));
  };
  const handleToDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    setToDate(new Date(event.target.value));
    const array: AttendanceData[] = attendance_array.filter(
      (data) => data.todayDate >= fromDate && data.todayDate <= toDate
    );
    setCurrent_Rows(array);
  };

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target.value;
    console.log(target);
    if (target.length > 2) {
      const array: AttendanceData[] = attendance_array
        .map((data) => {
          const month = String(data.todayDate.getMonth() + 1).padStart(2, "0");
          const year = data.todayDate.getFullYear();
          const day = String(data.todayDate.getDate()).padStart(2, "0");
          const value = `${year}-${month}-${day}`;
          console.log(value);
          return value === target ? data : undefined;
        })
        .filter((data): data is AttendanceData => data !== undefined);
      console.log(array);
      setCurrent_Rows(array);
    } else {
      setCurrent_Rows(attendance_array.slice(first_index, idx_last));
    }
  };
console.log("attendance data  : ", current_rows)
  return (
    <div className="w-[100vw] h-[120%] flex  bg-[#F3F8FB] border-2">
      <SideMenuBar current="AttendanceReport" />

      <div className="border-2 p-5 w-full flex-2 ">
        <p className="font-poppins text-[25px] font-semibold mb-5  ">
          Attendance Report
        </p>
        <div className="flex justify-between w-[95%]">
          {/* <p className="font-poppins text-[20px] font-semibold mb-5  ">
            insights
          </p> */}
          <div className="relative">
            <input
              onChange={handleSearchInput}
              placeholder="YYYY-MM-DD"
              className="mt-1 placeholder:text-[#83ACD8] placeholder:font-poppins
                pl-2 font-poppins text-[#83ACD8] rounded-md
                placeholder:pl-2 focus:outline-none
              w-[250px] h-[30px] border-2 border-[#a4c3e3]"
              type="text"
            ></input>
            <FontAwesomeIcon
              className="absolute top-3 right-3"
              size="1x"
              color="#83ACD8"
              icon={faSearch}
            />
          </div>
          <div className="flex items-center  ">
            <div className="flex items-center gap-3">
              <p className="text-[#1F4062] font-poppins font-semibold text-[17px]">
                Show Entries{" "}
              </p>
              <div className="w-[300px] h-[30px] mr-5 border-2 border-[#a4c3e3] flex  bg-white">
                <div className="pl-2">
                  <span className="text-[#1F4062] font-poppins text-[13px] font-semibold">
                    From :{" "}
                  </span>
                  <input
                    type="date"
                    onChange={handleFromDate}
                    className="w-[95px] focus:outline-none text-[#1F4062] font-poppins text-[13px]"
                  />
                </div>
                <div className="pl-2">
                  <span className="text-[#1F4062] font-poppins text-[13px] font-semibold">
                    To :{" "}
                  </span>
                  <input
                    type="date"
                    onChange={handleToDate}
                    className="w-[95px] focus:outline-none text-[#1F4062] font-poppins text-[13px]"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                className="w-[99px] bg-[#1D9BF0] text-white focus:outline-none p-1 h-[30px]
            font-poppins text-[12px] rounded-md
            border-[#a4c3e3]"
              >
                Export{" "}
                <FontAwesomeIcon icon={faFileExport} size="1x" color="white" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 h-[575px] w-[1205px] p-5 bg-white shadow-[#5A91CB] shadow-sm border-2 border-[#a4c3e3] rounded-md">
          <table cellPadding={10}>
            <thead>
              <th className="text-start w-[225px]">
                <span className="font-poppins text-[#2C5B8C]  ">Date</span>
                <FontAwesomeIcon
                  className="ml-3"
                  color="#2C5B8C"
                  icon={faRightLeft}
                  size="1x"
                />
              </th>
              <th className=" text-start w-[225px]">
                <span className="font-poppins text-[#2C5B8C]  ">Time in </span>
                <FontAwesomeIcon
                  className="ml-3"
                  color="#2C5B8C"
                  icon={faRightLeft}
                  size="1x"
                />
              </th>
              <th className=" text-start w-[225px]">
                <span className="font-poppins text-[#2C5B8C]  ">Time out </span>
                <FontAwesomeIcon
                  className="ml-3"
                  color="#2C5B8C"
                  icon={faRightLeft}
                  size="1x"
                />
              </th>
              <th className=" text-start w-[225px]">
                <span className="font-poppins text-[#2C5B8C]  ">
                  Lunch Hours{" "}
                </span>
                <FontAwesomeIcon
                  className="ml-3"
                  color="#2C5B8C"
                  icon={faRightLeft}
                  size="1x"
                />
              </th>
              <th className=" p-2 text-start w-[225px]">
                <span className="font-poppins text-[#2C5B8C]  ">
                  Working Hours{" "}
                </span>
                <FontAwesomeIcon
                  className="ml-3"
                  color="#2C5B8C"
                  icon={faRightLeft}
                  size="1x"
                />
              </th>
            </thead>
            <tbody>
              {current_rows.length > 0 ? (
                <>
                  {current_rows.map((data) => {
                    return (
                      <tr>
                        <td className="border-t-0 border-l-0 border-r-0  border-2 border-[#D6E3F2]">
                          <span className=" font-poppins  text-[#67a2e0]">
                            {data.clock_in.getFullYear()}-
                            {String(data.clock_in.getMonth() + 1).padStart(
                              2,
                              "0"
                            )}
                            -{String(data.clock_in.getDate()).padStart(2, "0")}
                          </span>
                        </td>
                        <td className=" border-t-0 border-l-0 border-r-0  border-2 border-[#D6E3F2]">
                          <span
                            className={`font-poppins ${
                              data.clock_in.getHours() > 8 ||
                              (data.clock_in.getHours() === 8 &&
                                data.clock_in.getMinutes() > 10)
                                ? "text-[#e85e38]"
                                : "text-green-300"
                            }`}
                          >
                            {String(data.clock_in.getHours()).padStart(2, "0")}{" "}
                            :{" "}
                            {String(data.clock_in.getMinutes()).padStart(
                              2,
                              "0"
                            )}
                          </span>
                        </td>
                        <td className=" border-t-0 border-l-0 border-r-0  border-2 border-[#D6E3F2]">
                          <span className=" font-poppins  text-[#67a2e0]">
                            {data.clock_out !== null
                              ? `${String(data.clock_out.getHours()).padStart(
                                  2,
                                  "0"
                                )}:${String(
                                  data.clock_out.getMinutes()
                                ).padStart(2, "0")}`
                              : "not clocked out"}
                          </span>
                        </td>
                        <td className="mt-8 p-1 border-t-0 border-l-0 border-r-0  border-2 border-[#D6E3F2]">
                          <span className=" font-poppins  text-[#67a2e0]">
                            1 Hr 00 Mins 00 Secs
                          </span>
                        </td>
                        <td className=" border-t-0 border-l-0 border-r-0  border-2 border-[#D6E3F2]">
                          <span className=" font-poppins  text-[#67a2e0]">
                            {Math.floor(data.workHours.seconds / 3600)} Hr{" "}
                            {Math.floor((data.workHours.seconds % 3600) / 60)}{" "}
                            Mins {data.workHours.seconds % 60} Secs
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </>
              ) : (
                <p className=" font-poppins font-semibold text-[18px]   text-[#67a2e0]">
                  No Data Found
                </p>
              )}
            </tbody>
          </table>
          <div className="mt-4 ">
            <div className="flex gap-2  w-[96%] justify-end ">
              {pages.length > 1 &&
                pages.map((_, idx) => {
                  return (
                    <button
                      onClick={() => {
                        setCurrentPage(idx + 1);
                      }}
                      className={`p-1  rounded-md w-[40px] ${
                        idx + 1 === currentPage ? "bg-[#3A4C4F]" : "bg-white "
                      } 
            ${idx + 1 === currentPage ? "text-white" : "text-[#3A4C4F] "}
            font-poppins font-semibold `}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
