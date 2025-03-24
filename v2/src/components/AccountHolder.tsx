import React from "react";
import { GenerateAvator } from "../utils/GenerateAvator";
import { GenerateInitials } from "../utils/GenerateInitials";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

type Props = {};

export default function AccountHolder({}: Props) {
  const user = useSelector((state: RootState) => state.user);
  const surname = useSelector((state: RootState) => state.user.surname);
  console.log("user profile pic : "+ JSON.stringify(user))
  return (
    <div className=" gap-3 flex w-[180px] items-center right-0">
      <img
        src={user.profile_pic.length > 10  ? user.profile_pic : GenerateAvator(`${user.fullName} ${user.surname}`)}
        className="w-[30px] h-[30px] rounded-full"
        alt="imagek"
      />

      <p className="font-poppins mt-[1px]">
        {GenerateInitials(`${user.fullName} ${user.surname}`)}
      </p>
    </div>
  );
}
