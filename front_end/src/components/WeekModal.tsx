import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";

import { faCaretLeft, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { setHRattendanceData, UserAttendance } from "../redux/AttendanceSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
type Props = {
  setselectedDate: React.Dispatch<React.SetStateAction<Date>>
};

export default function WeekModal({
  setselectedDate
}: Props) {
  const WEEKDAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = new Date();
  const [selected, setSelected] = useState(today.getDate());
  const startOfWeek = new Date(today);
  const dispatch = useDispatch();
  startOfWeek.setDate(today.getDate() - today.getDay());
  const attendance_map = useSelector(
    (state: RootState) => state.attendance_data.all_attendance_data
  );
  const daysInThisWeek: number[] = [];

  for (let i = -7; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    daysInThisWeek.push(date.getDate());
  }

  type week_day_render = { day: number; weekday: string };
  const list: week_day_render[] = [];

  for (let i = 0; i < daysInThisWeek.length; i++) {
    list.push({
      day: daysInThisWeek[i],
      weekday: WEEKDAYS[i % 7],
    });
  }

  const itemsPerPage = 7;
  const [index, setIndex] = useState(list.length - itemsPerPage);
  const currentItems = list.slice(index, index + itemsPerPage);
  const determineRec = (map: Map<string, UserAttendance[]>, selected: Date) => {
    console.log("week dmodal selected date : "+ selected)
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

    console.log("Found records:", day_records);

    // Dispatch the records found for the selected day
    dispatch(setHRattendanceData(day_records));
  };

  useEffect(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const seleted_date = new Date(year, month, selected-1);
    seleted_date.setHours(23, 60, 60, 60);
    setselectedDate(seleted_date)
    determineRec(attendance_map, seleted_date);
    console.log("selected date : " + seleted_date);
  }, [selected]);

  const handleNext = () => {
    if (currentItems.length <= 6) {
      setIndex((prevIndex) => {
        return prevIndex === 0 ? 0 : prevIndex - 1;
      });
    }
    setSelected((prev) => {
      return prev === list[list.length - 1].day
        ? list[list.length - 1].day
        : prev + 1;
    });
    setIndex((prevIndex) => {
      return prevIndex === list.length - 1 ? list.length - 1 : prevIndex + 1;
    });
  };

  const handlePrev = () => {
    setSelected((prev) => {
      return prev === list[0].day ? list[0].day : prev - 1;
    });
    setIndex((prevIndex) => {
      return prevIndex === 0 ? 0 : prevIndex - 1;
    });
  };

  return (
    <div className="mt-8 flex gap-3 text-center">
      <div
        onClick={handlePrev}
        className="p-1 hover:cursor-pointer hover:border-[#3A4C4F]  hover:border-2 w-[75px]  rounded-md flex justify-center items-center bg-white"
      >
        <FontAwesomeIcon icon={faCaretLeft} size="1x" color="black" />
      </div>
      <div className=" flex gap-2 w-[1050px]  p-1  rounded-md  overflow-hidden">
        <AnimatePresence>
          {currentItems.map((val, idx) => (
            <motion.div
              key={`${val.day}-${val.weekday}`}
              initial={{ opacity: 0.5, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0.5, x: 0 }}
              transition={{ duration: 0.2 }}
              className={`p-2  ${
                selected === val.day ? "bg-[#3A4C4F]" : "bg-white"
              } rounded-md w-[395px]  items-center`}
            >
              <p
                className={`font-poppins ${
                  selected === val.day && "text-white"
                }  font-semibold text-[16px]`}
              >
                {val.day}
              </p>
              <p
                className={`font-poppins  ${
                  selected === val.day && "text-white"
                }  font-semibold text-[12px]`}
              >
                {val.weekday}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div
        onClick={handleNext}
        className="p-1 hover:cursor-pointer hover:border-[#3A4C4F]  hover:border-2 w-[75px]  rounded-md flex justify-center items-center bg-white"
      >
        <FontAwesomeIcon icon={faCaretRight} size="1x" color="black" />
      </div>
    </div>
  );
}
