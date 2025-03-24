import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faChartColumn,
  faUser,
  faDoorOpen,
} from "@fortawesome/free-solid-svg-icons";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { RootState } from "../redux/store";
import { useSelector } from "react-redux";
type Props = {
  current: string;
};
export const log_out = (nav: NavigateFunction) => {
  localStorage.clear();
  nav("/");
};

export default function SideMenuBarHR({ current }: Props) {
  const usr = useSelector((state: RootState) => state.user);
  const nav = useNavigate();
  return (
    <div className="bg-[#3A4C4F] h-[100vh]   w-[250px] ">
      <div className="w-full pl-3">
        <div className="mb-5">
          <span className="font-poppins font-bold text-[58px] text-[#f6f0d2]">
            HR
          </span>
          <span className="font-poppins font-bold text-[28px] text-[#bcb79f]">
            Staff
          </span>
        </div>
        <p className="font-poppins font-semibold  text-white mb-4 ">Menu</p>

        <div className="flex hover:cursor-pointer items-center mb-3">
          <div className="bg-[#ddc764] mt-4  w-1 h-9"></div>
          <div className=" p-2 rounded-sm w-[180px]  flex items-center gap-3 mt-4">
            <FontAwesomeIcon icon={faCalendar} size="1x" color="#f6f0d2" />
            <p className="font-poppins font-semibold text-[14px]  text-[#f6f0d2]">
              Attendance
            </p>
          </div>
        </div>
        <div className="flex hover:cursor-pointer items-center mb-4">
          <div
            onClick={() => {
              log_out(nav);
            }}
            className=" p-2 rounded-sm w-[180px]  flex items-center gap-3 mt-4"
          >
            <FontAwesomeIcon icon={faDoorOpen} size="1x" color="white" />
            <p className="font-poppins font-semibold text-[14px]  text-white">
              Exit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
