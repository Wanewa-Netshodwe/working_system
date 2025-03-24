import React, { useEffect, useState } from "react";
import { faUserGroup, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import AnimatedNumbers from "react-animated-numbers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SideMenuBarHR from "../components/SideMenuBarHR";
import WeekModal from "../components/WeekModal";
import { GenerateAvator } from "../utils/GenerateAvator";
import { GenerateInitials } from "../utils/GenerateInitials";
import "./table.css";
import HRDashboardLoader from "../components/HRDashboardLoader";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import {
  setAllattendance,
  setHRattendanceData,
  UserAttendance,
} from "../redux/AttendanceSlice";
import { calculateChangeHR, DataChange, isOnTime } from "../utils/Analytics";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Spinner from "../components/Spinner";
type Props = {};

export default function DashboardHR({}: Props) {
  const navigate = useNavigate();
  const data = [
    {
      name: "Wanewa Blessing Netshodwe",
      timeIn: "10H25",
      timeOut: "19H25",
      email: "25527722@tut4life.ac.za",
    },
    {
      name: "John Doe",
      timeIn: "09H00",
      timeOut: "18H00",
      email: "john.doe@tut4life.ac.za",
    },
  ];

  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [seletectedDate, setselectedDate] = useState<Date>(new Date());
  const [analytics, setAnayltics] = useState<DataChange>();
  const yesterday_rec = useSelector(
    (state: RootState) => state.attendance_data.HR_attendance_data
  );
  const all_attendance = useSelector(
    (state: RootState) => state.attendance_data.all_attendance_data
  );
  const [currentPage, setCurrentPage] = useState(1);
  const items_per_page = 5;
  const pages_i = Math.round(yesterday_rec.length / items_per_page);
  const pages = Array.from({ length: pages_i }).fill(1);
  const idx_last = currentPage * items_per_page;
  const first_index = idx_last - items_per_page;
  const current_rows = yesterday_rec.slice(first_index, idx_last);

  const determineRec = (map: Map<string, UserAttendance[]>, selected: Date) => {
    const selected_start = new Date(selected);
    selected_start.setHours(0, 0, 0, 0);
    const selected_end = new Date(selected);
    selected_end.setHours(23, 59, 59, 999);
    let day_records: UserAttendance[] = [];
    map.forEach((records, fullName) => {
      records.forEach((record) => {
        const recordDate = new Date(record.todayDate);

        if (recordDate >= selected_start && recordDate <= selected_end) {
          day_records.push(record);
        }
      });
    });
    const yesterdayStart = new Date(selected);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);

    let yesterday_records: UserAttendance[] = [];

    map.forEach((records, fullName) => {
      records.forEach((record) => {
        const recordDate = new Date(record.todayDate);
        if (recordDate >= yesterdayStart && recordDate <= selected) {
          yesterday_records.push(record);
        }
      });
    });
    console.log("prev date: " + yesterdayStart);
    console.log("current date: " + selected);
    console.log(
      "comparing prev " +
        JSON.stringify(yesterday_records) +
        "and curent :" +
        JSON.stringify(day_records)
    );
    setAnayltics(calculateChangeHR(yesterday_records, day_records));
  };
  useEffect(() => {
    determineRec(all_attendance, seletectedDate);
  }, [seletectedDate]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1300);
  }, []);
  const dispatch = useDispatch();

  const handle_refresh_btn = async () => {
    setRefresh(true);

    const result = await axios.get("http://localhost:8092/api/report", {
      headers: { role: "HR" },
    });
    if (result.status === 200) {
      if (typeof result.data === "object" && result.data !== null) {
        const map: Map<string, UserAttendance[]> = new Map();

        Object.entries(result.data).forEach(([fullName, attendanceRecords]) => {
          console.log(`Processing records for: ${fullName}`);
          if (Array.isArray(attendanceRecords)) {
            attendanceRecords.forEach((data: any) => {
              console.log(data);
              if (!map.has(fullName)) {
                map.set(fullName, []);
              }
              map.get(fullName)?.push(data);
            });
          } else {
            console.error(
              `Expected an array for ${fullName}, but got:`,
              attendanceRecords
            );
          }
        });

        const yesterdayStart = new Date();
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        yesterdayStart.setHours(0, 0, 0, 0);
        console.log("Mapped Data:", map);

        let yesterday_records: UserAttendance[] = [];
        const now_date = new Date();

        map.forEach((records, fullName) => {
          records.forEach((record) => {
            const recordDate = new Date(record.todayDate);
            if (recordDate >= yesterdayStart && recordDate <= now_date) {
              yesterday_records.push(record);
            }
          });
        });
        dispatch(setAllattendance(map));
        dispatch(setHRattendanceData(yesterday_records));
      }
    }
    setTimeout(() => {
      setRefresh(false);
    }, 700);
  };

  return (
    <div>
      {loading ? (
        <HRDashboardLoader />
      ) : (
        <div className={`w-[100vw] z-10 h-[120%] flex bg-[#3A4C4F]    `}>
          <SideMenuBarHR current="Dashboard" />

          <div className="rounded-tl-xl bg-[#F8F7F1]  p-5 w-full flex-2 ">
            <div className="flex items-center  gap-6">
              <p className="font-poppins font-semibold text-[20px]">
                Attendance
              </p>
              <div className="p-2 w-[40px] h-[40px] flex items-center hover:bg-[#3A4C4F]  justify-center border-2 border-[#3A4C4F] rounded-full ">
                {refresh ? (
                  <Spinner color="#3A4C4F" />
                ) : (
                  <FontAwesomeIcon
                    onClick={handle_refresh_btn}
                    icon={faRotateRight}
                    className="text-[#3A4C4F] hover:cursor-pointer  hover:text-white"
                    size="1x"
                  />
                )}
              </div>
            </div>

            <div className="mt-3 flex gap-3">
              <div
                className={`p-4 flex flex-col gap-3  w-[260px] rounded-md  ${
                  analytics?.changes.attendance_change!! < 0
                    ? "bg-[#f18b8b]"
                    : "bg-[#d5eada]"
                }`}
              >
                <div>
                  <FontAwesomeIcon
                    icon={faUserGroup}
                    color={`  ${
                      analytics?.changes.attendance_change!! < 0
                        ? "text-[#d9dada]"
                        : "text-[#3A4C4F]"
                    }`}
                  />
                </div>
                <div>
                  <p
                    className={`text-[20px] font-poppins font-semibold  ${
                      analytics?.changes.attendance_change!! < 0
                        ? "text-[#d9dada]"
                        : "text-[#3A4C4F]"
                    } `}
                  >
                    {analytics?.total_records_current} Students
                  </p>
                </div>

                <div>
                  <span
                    className={`text-[15px] font-poppins font-semibold ${
                      analytics?.changes.attendance_change!! < 0
                        ? "text-[#e13232]"
                        : "text-[#3b8956]"
                    }`}
                  >
                    {analytics?.changes.attendance_change!! < 0 ? " -" : "+"}{" "}
                    {Math.abs(analytics?.changes.attendance_change!!)}%
                  </span>
                  <span
                    className={`text-[12px] font-poppins font-semibold  ${
                      analytics?.changes.attendance_change!! < 0
                        ? "text-[#d9dada]"
                        : "text-[#818383]"
                    }`}
                  >
                    vs {seletectedDate.getFullYear()}/
                    {seletectedDate.getMonth() + 1}/
                    {seletectedDate.getDate() - 1}
                  </span>
                </div>
              </div>

              <div
                className={`p-4 flex flex-col gap-3  w-[260px] rounded-md  ${
                  analytics?.changes.attendance_change!! < 0
                    ? "bg-[#f18b8b]"
                    : "bg-[#d5eada]"
                }`}
              >
                <div>
                  <FontAwesomeIcon
                    icon={faUserGroup}
                    color={`  ${
                      analytics?.changes.attendance_change!! < 0
                        ? "text-[#d9dada]"
                        : "text-[#3A4C4F]"
                    }`}
                  />
                </div>
                <div>
                  <p
                    className={`text-[20px] font-poppins font-semibold  ${
                      analytics?.changes.attendance_change!! < 0
                        ? "text-[#d9dada]"
                        : "text-[#3A4C4F]"
                    } `}
                  >
                    {analytics?.total_records_current!! -
                      analytics?.total_records_prev!! >
                    0
                      ? 0
                      : analytics?.total_records_current!! -
                        analytics?.total_records_prev!!}{" "}
                    Absent
                  </p>
                </div>
                <div>
                  <span
                    className={`text-[15px] font-poppins font-semibold ${
                      analytics?.changes.attendance_change!! < 0
                        ? "text-[#e13232]"
                        : "text-[#3b8956]"
                    }`}
                  >
                    {analytics?.changes.attendance_change!! < 0 ? " -" : "+"}{" "}
                    {Math.abs(analytics?.changes.attendance_change!!)}%
                  </span>
                  <span
                    className={`text-[12px] font-poppins font-semibold  ${
                      analytics?.changes.attendance_change!! < 0
                        ? "text-[#d9dada]"
                        : "text-[#818383]"
                    }`}
                  >
                    vs {seletectedDate.getFullYear()}/
                    {seletectedDate.getMonth() + 1}/
                    {seletectedDate.getDate() - 1}
                  </span>
                </div>
              </div>

              <div
                className={`p-4 flex flex-col gap-3  w-[260px] rounded-md  ${
                  analytics?.changes.ontime_perc_change!! < 0
                    ? "bg-[#f18b8b]"
                    : "bg-[#d5eada]"
                }`}
              >
                <div>
                  <FontAwesomeIcon
                    icon={faUserGroup}
                    color={`  ${
                      analytics?.changes.ontime_perc_change!! < 0
                        ? "text-[#d9dada]"
                        : "text-[#3A4C4F]"
                    }`}
                  />
                </div>
                <div>
                  <p
                    className={`text-[20px] font-poppins font-semibold  ${
                      analytics?.changes.ontime_perc_change!! < 0
                        ? "text-[#d9dada]"
                        : "text-[#3A4C4F]"
                    } `}
                  >
                    {analytics?.changes.ontime_perc_change!! < 0
                      ? " 0"
                      : analytics?.changes.ontime_perc_change!!}
                    <span
                      className={` text-[16px]   ${
                        analytics?.changes.ontime_perc_change!! < 0
                          ? "text-[#d9dada]"
                          : "text-[#3A4C4F]"
                      } font-poppins font-semibold`}
                    >
                      % onTime
                    </span>
                  </p>
                </div>
                <div>
                  <span
                    className={`text-[15px] font-poppins font-semibold ${
                      analytics?.changes.ontime_perc_change!! < 0
                        ? "text-[#e13232]"
                        : "text-[#3b8956]"
                    }`}
                  >
                    {analytics?.changes.ontime_perc_change!! < 0 ? "-" : "+"}
                    {Math.abs(analytics?.changes.ontime_perc_change!!)}%
                  </span>
                  <span
                    className={`text-[12px] font-poppins font-semibold  ${
                      analytics?.changes.ontime_perc_change!! < 0
                        ? "text-[#d9dada]"
                        : "text-[#818383]"
                    }`}
                  >
                    vs {seletectedDate.getFullYear()}/
                    {seletectedDate.getMonth() + 1}/
                    {seletectedDate.getDate() - 1}
                  </span>
                </div>
              </div>

              <div
                className={`p-4 flex flex-col gap-3  w-[260px] rounded-md  ${
                  analytics?.changes.late_perc_change!! < 0
                    ? "bg-[#d5eada]"
                    : "bg-[#f18b8b]"
                }`}
              >
                <div>
                  <FontAwesomeIcon
                    icon={faUserGroup}
                    color={` ${
                      analytics?.changes.late_perc_change!! < 0
                        ? "#3A4C4F"
                        : "#d9dada"
                    }`}
                  />
                </div>
                <div>
                  <p
                    className={`text-[20px] font-poppins font-semibold  ${
                      analytics?.changes.late_perc_change!! < 0
                        ? "text-[#3A4C4F]"
                        : "text-[#d9dada]"
                    } `}
                  >
                    {analytics?.changes.late_perc_change!! < 0
                      ? " 0"
                      : analytics?.changes.late_perc_change!!}
                    <span
                      className={` text-[16px]   ${
                        analytics?.changes.late_perc_change!! < 0
                          ? "text-[#3A4C4F]"
                          : "text-[#d9dada]"
                      } font-poppins font-semibold`}
                    >
                      % Late
                    </span>
                  </p>
                </div>
                <div>
                  <span
                    className={`text-[15px] font-poppins font-semibold ${
                      analytics?.changes.late_perc_change!! < 0
                        ? "text-[#3b8956]"
                        : "text-[#e13232]"
                    }`}
                  >
                    {analytics?.changes.late_perc_change!! < 0 ? "+" : "-"}
                    {Math.abs(analytics?.changes.late_perc_change!!)}%
                  </span>
                  <span
                    className={`text-[12px] font-poppins font-semibold  ${
                      analytics?.changes.late_perc_change!! < 0
                        ? "text-[#818383]"
                        : "text-[#d9dada]"
                    }`}
                  >
                    vs {seletectedDate.getFullYear()}/
                    {seletectedDate.getMonth() + 1}/
                    {seletectedDate.getDate() - 1}
                  </span>
                </div>
              </div>
            </div>

            <WeekModal setselectedDate={setselectedDate} />

            <table cellPadding="10" cellSpacing={"50"} className="mt-8 ">
              <thead className="p-1">
                <th className="w-[350px]">
                  <p className=" text-start font-poppins font-semibold">
                    Employee Name
                  </p>
                </th>
                <th className="w-[420px]">
                  <p className=" text-start font-poppins font-semibold">
                    clock-in && clock-out
                  </p>
                </th>
                <th className="w-[300px]">
                  <p className=" text-start font-poppins font-semibold">
                    Email Address
                  </p>
                </th>
                <th className="w-[200px]">
                  <p className=" text-start font-poppins font-semibold">Role</p>
                </th>
              </thead>
              <tbody>
                {current_rows.length > 0 ? (
                  current_rows.map((val) => {
                    return (
                      <tr
                        onClick={() =>
                          navigate("/HR/student", {
                            state: {
                              fullname: `${val.user_id.fullName} ${val.user_id.surname}`,
                              data_map: all_attendance,
                            },
                          })
                        }
                        className=" hover:cursor-pointer rounded-lg "
                      >
                        <td>
                          <div className=" gap-3 flex w-[180px] items-center right-0">
                            <img
                              src={
                                val.user_id.profile_pic.length > 5
                                  ? val.user_id.profile_pic
                                  : GenerateAvator(`${val.user_id.fullName}`)
                              }
                              className="w-[30px] h-[30px] rounded-full"
                              alt="imagek"
                            />

                            <p className="font-poppins font-semibold mt-[1px]">
                              {GenerateInitials(
                                `${val.user_id.fullName} ${val.user_id.surname}`
                              )}
                            </p>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-5">
                            <p
                              className={`font-poppins font-semibold ${
                                !isOnTime(new Date(val.clock_in)) &&
                                "text-red-500"
                              } text-[14px]`}
                            >
                              {String(
                                new Date(val.clock_in).getHours()
                              ).padStart(2, "0")}
                              H
                              {String(
                                new Date(val.clock_in).getMinutes()
                              ).padStart(2, "0")}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                <div className="bg-gray-400 h-3 w-3 rounded-full"></div>
                                <div className="bg-gray-400 h-1 w-8 "></div>
                              </div>
                              <span className="font-poppins text-[11px] text-gray-400">
                                {val.clock_out
                                  ? `${String(val.workHours.hours).padStart(
                                      2,
                                      "0"
                                    )} : 
                              ${String(val.workHours.minutes).padStart(
                                2,
                                "0"
                              )} : 
                              ${String(val.workHours.seconds).padStart(2, "0")}
                              `
                                  : "not clocked out"}
                              </span>
                              <div className="flex items-center">
                                <div className="bg-gray-400 h-1 w-8 "></div>
                                <div className="bg-gray-400 h-3 w-3 rounded-full"></div>
                              </div>
                            </div>
                            <p className="font-poppins font-semibold text-[14px]">
                              {val.clock_out
                                ? `  ${String(
                                    new Date(val.clock_out).getHours()
                                  ).padStart(2, "0")}H
                            ${String(
                              new Date(val.clock_out).getMinutes()
                            ).padStart(2, "0")}`
                                : "not clocked out"}
                            </p>
                          </div>
                        </td>
                        <td>
                          <p className="font-poppins font-semibold text-[14px]">
                            {val.user_id.emailAddress}
                          </p>
                        </td>
                        <td>
                          <p className="font-poppins font-semibold text-[14px]">
                            {val.user_id.job}
                          </p>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <p className="font-poppins font-semibold text-[16px]">
                    {" "}
                    No data found{" "}
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
      )}
    </div>
  );
}
