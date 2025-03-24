import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { setClockin, setUserDetails, UserState } from "../redux/UserSlice";
import { useDispatch } from "react-redux";
import { setTime, startTimer } from "../redux/timerSlice";
import {
  AttendanceData,
  setAllattendance,
  setHRattendanceData,
  UserAttendance,
} from "../redux/AttendanceSlice";
import { workMotivationQuotes } from "../utils/Quotes";
import Spinner from "../components/Spinner";
const SignInPage = () => {
  useEffect(() => {
    const rand = Math.round(1 + Math.random() * 39);
    setNum(rand);
  }, []);

  const [r_num, setNum] = useState(0);
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setShowMessage] = useState(false);
  const [student_num, setStudentNum] = useState("");
  useEffect(() => {
    setTimeout(() => {
      setShowMessage(false);
      setLoading(false)
    }, 4000);
  }, [message]);
  const handleChangePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };
  const handleChangeStudentNumber = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStudentNum(event.target.value);
  };
  const handleSubmit = async () => {
    setLoading(true);
    if (student_num.startsWith("110")) {
      const result = await axios.get("http://localhost:8092/api/report", {
        headers: { role: "HR" },
      });
      if (result.status === 200) {
        if (typeof result.data === "object" && result.data !== null) {
          const map: Map<string, UserAttendance[]> = new Map();

          Object.entries(result.data).forEach(
            ([fullName, attendanceRecords]) => {
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
            }
          );

          

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

          setTimeout(() => {
            nav("/HR/Dashboard");
          }, 3000);
        }
      }
      setLoading(false);

      return;
    }
    let obj = {
      studentNum: student_num,
      password: password,
    };
    try {
      const result = await axios.post("http://localhost:8092/api/login", obj);
      if (result.status === 200) {
        console.log(new Date(result.data.createdAt));
        console.log("new account : " + result.data.user.new_account);
        console.log("Recievd user account : " + Object.entries(result.data.user));
        let usr: UserState = {
          department: result.data.user.department,
          job: result.data.user.job,
          new_account: result.data.user.new_account,
          id: result.data.user.id,
          clocked_in: result.data.user.seconds > 0 ? true : false,
          profile_pic: result.data.user.profile_pic,
          contactNo: result.data.user.contactNo,
          emailAddress: result.data.user.emailAddress,
          fullName: result.data.user.fullName,
          gender: result.data.user.gender,
          password: result.data.user.password,
          studentNumber: result.data.user.studentNumber,
          surname: result.data.user.surname,
          createdAt: new Date(result.data.user.createdAt),
        };
        console.log("user account to be used  : " + Object.entries(usr));
        if (result.data.seconds > 0) {
          dispatch(setClockin(result.data.clockin));
          if (result.data.clockin) {
            dispatch(startTimer());
          }
          dispatch(setTime(result.data.seconds));
        }

        console.log(result);
        dispatch(setUserDetails(usr));
        setLoading(false);
        nav("/Dashboard");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
          setShowMessage(true);
        }
      }
    }
  };

  return (
    <div className="flex  min-h-screen bg-gray-100">
      <div className="bg-[#C6E6FB]  w-full  items-center">
        <div className=" self-center p-12  ">
          <h1 className="font-poppins font-semibold text-[30px]">Login</h1>
          <h1 className="font-poppins font-semibold text-[25px] mt-2">
            Welcome Back
          </h1>
          <p className="font-poppins font-light text-[16px] mt-2">
            Please enter your Attendance credentials.
          </p>
          {message && (
            <div>
              <p className="font-poppins font-light text-red-500 text-[16px] mt-2">
                Invalid credentials
              </p>
            </div>
          )}

          <div className=" flex gap-16 mb-1">
            <div className="mt-5 ">
              <p className="font-poppins font-semibold text-[15px]">
                Student Number
              </p>
              <input
                onChange={handleChangeStudentNumber}
                placeholder="First Name "
                className="mt-1 placeholder:text-[#83ACD8] placeholder:font-poppins
                pl-2 font-poppins text-[#83ACD8] rounded-md
                placeholder:pl-2 focus:outline-none
              w-[565px] h-[35px] border-2 border-[#83ACD8]"
                type="text"
              ></input>
            </div>
          </div>
          <div className=" flex gap-16 mb-1">
            <div className="mt-5 ">
              <p className="font-poppins font-semibold text-[15px]">Password</p>
              <input
                onChange={handleChangePassword}
                placeholder="First Name "
                className="mt-1 placeholder:text-[#83ACD8] placeholder:font-poppins
                pl-2 font-poppins text-[#83ACD8]
                placeholder:pl-2 focus:outline-none rounded-md
              w-[565px] h-[35px] border-2 border-[#83ACD8]"
                type="password"
              ></input>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className=" mt-5 hover:bg-[#2b81ba] items-center flex justify-center  gap-3 font-poppins text-white bg-[#1D9BF0] w-[565px] p-2  rounded-md "
          >
            Login
            {loading && <Spinner color="green" />}
          </button>
          <p className="mt-5 text-center mr-24 text-[#5A91CB] text-poppins font-semibold ">
            Don't you have account?
            <a className="text-[#1D9BF0]" href="/">
              Register
            </a>
          </p>
        </div>
      </div>
      <div className="bg-gradient-to-r flex items-center justify-center  from-[#72C0F6] via-[#56B4F4] to-[#1D9BF0] w-full">
        <div className="bg-gradient-to-r  from-[#72C0F6] via-[#56B4F4] to-[#1D9BF0] items-center flex justify-center w-full">
          <p className="font-poppins p-4 font-semibold text-[19px] bg-gradient-to-r from-[#262626] via-[#b0ba6a] to-[#a3ba0c] text-transparent bg-clip-text ">
            {workMotivationQuotes[r_num]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
