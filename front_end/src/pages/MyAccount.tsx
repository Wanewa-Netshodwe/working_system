import React, { useEffect, useRef, useState } from "react";
import SideMenuBar from "../components/SideMenuBar";
import { faPen, faLock, faCamera } from "@fortawesome/free-solid-svg-icons";
import "react-day-picker/style.css";
import "../components/clock.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GenerateAvator } from "../utils/GenerateAvator";
import Spinner from "../components/Spinner";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { increment } from "../redux/timerSlice";
import axios from "axios";
import { UserState } from "../redux/UserSlice";

type Props = {};

export default function MyAccount({}: Props) {
  const usr = useSelector((state: RootState) => state.user);
  console.log("usr in my account page "+Object.entries(usr))
  const [image, setImage] = useState("");
  const [file, setFile] = useState("");
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
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
  const handleClick = () => {
    //@ts-ignore
    fileInputRef.current.click();
  };

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      let i = URL.createObjectURL(file);
      setImage(i);
      setFile(file);
    }
  };
  const submit = async () => {
    const formData = new FormData();
    formData.append("file", file);
    let new_usr ={
      createdAt:usr.createdAt,
      id:usr.id,
      department:usr.department,
      password:usr.password,
      profile_pic:usr.password,
      job:usr.job,
      new_account:usr.new_account,
      emailAddress:email,
      gender:gender,
      fullName : first_name,
      surname:last_name,
      studentNumber:student_num,
      contactNo:contact
    } 
    
    formData.append(
      "user",
      JSON.stringify(new_usr)
    );

    try {
      const response = await axios.post(
        "http://localhost:8092/api/upload",
        formData
      );

      if (response.status === 200) {
        console.log(response.data);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
    setLoading(false)
  };

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(usr.emailAddress);
  const [contact, setContact] = useState(usr.contactNo);
  const [first_name, setFirstname] = useState(usr.fullName);
  const [last_name, setLastname] = useState(usr.surname);
  const [student_num, setStudentNum] = useState(usr.studentNumber);
  const [gender, setGender] = useState(usr.gender);
  const handleChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };
  const handleChangeFirstName = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFirstname(event.target.value);
  };
  const handleChangeLastName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLastname(event.target.value);
  };
  const handleChangeStudentNumber = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStudentNum(event.target.value);
  };
  const handleChangeGender = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setGender(event.target.value);
  };
  const handleChangeContact = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContact(event.target.value);
  };

  return (
    <div className="w-[100vw] h-[120%] flex  bg-[#F3F8FB] border-2">
      <SideMenuBar current="MyAccount" />

      <div className="border-2 p-5 w-full flex-2 ">
        <div className="mt-8 h-[725px] w-[1150px]   bg-white shadow-[#5A91CB] shadow-sm border-2 border-[#a4c3e3] rounded-md">
          <div className="relative">
            <div className="w-full  flex items-center  justify-end bg-[#AAD9F9] h-[100px]">
              <div className="mr-16 flex gap-6">
                <FontAwesomeIcon
                  onClick={() => {
                    setEditing(true);
                  }}
                  icon={faPen}
                  size="1x"
                  color="white"
                  className="hover:cursor-pointer hover:text-[#254f7b]"
                />

                <FontAwesomeIcon
                  icon={faLock}
                  size="1x"
                  color="white"
                  className="hover:cursor-pointer hover:text-[#254f7b]"
                />
              </div>
            </div>
            <div className="absolute top-3 left-[467px]">
              <div className="border-4 relative border-white flex flex-col items-center justify-center w-[160px] rounded-full p-2 ">
                <img
                  src={
                    usr.profile_pic.length > 5 ?
                    usr.profile_pic
                    : 
                    image.length > 4
                      ? image
                      : GenerateAvator(`${usr.fullName} ${usr.surname}`)
                  }
                  className="w-[140px] h-[140px]  rounded-full"
                  alt="ii"
                />

                <div className="bg-gray-700  -bottom-10 p-2 h-[60px] w-[60px] items-center justify-center flex   absolute rounded-full">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                  />
                  <FontAwesomeIcon
                    onClick={handleClick}
                    className="hover:cursor-pointer"
                    icon={faCamera}
                    size="2x"
                    color="white"
                  />
                </div>
                <p className="absolute -bottom-20 font-poppins  text-center text-[#7e7e7e] text-[18px] font-semibold w-[580px]">
                  {usr.fullName} {usr.surname}
                </p>

                <p className="absolute -bottom-[110px] font-poppins  text-center text-[#8e7e7e] text-[15px] font-semibold w-[580px]">
                  {usr.job}
                </p>
              </div>
            </div>
            <div className="  h-[600px]  p-44 pl-48">
              <p className="font-poppins  text-[19px] w-[720px] font-semibold  ">
                Account Details
                <hr className="mt-2 border-1 border-[#83ACD8]"></hr>
              </p>
              <div className="mt-4 flex gap-5">
                <div className="w-[350px]">
                  <p className="text-[#83ACD8] font-poppins ">First Name</p>
                  {editing ? (
                    <input
                      value={`${first_name}`}
                      onChange={handleChangeFirstName}
                      placeholder={`${first_name}`}
                      className="mt-1 
                pl-2 font-poppins text-[#434343] rounded-md
                placeholder:pl-2 focus:outline-none
              w-[250px] h-[35px] border-2 border-[#83ACD8]"
                      type="text"
                    ></input>
                  ) : (
                    <p className=" font-poppins  ">{first_name}</p>
                  )}
                </div>
                <div className="w-[350px]">
                  <p className="text-[#83ACD8] font-poppins ">Last Name</p>
                  {editing ? (
                    <input
                      value={`${last_name}`}
                      onChange={handleChangeLastName}
                      className="mt-1 
                pl-2 font-poppins text-[#434343] rounded-md
                placeholder:pl-2 focus:outline-none
              w-[250px] h-[35px] border-2 border-[#83ACD8]"
                      type="text"
                    ></input>
                  ) : (
                    <p className=" font-poppins  ">{last_name}</p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex gap-5">
                <div className="w-[350px]">
                  <p className="text-[#83ACD8] font-poppins ">Contact number</p>
                  {editing ? (
                    <input
                      value={`${contact}`}
                      onChange={handleChangeContact}
                      className="mt-1 
                pl-2 font-poppins text-[#434343] rounded-md
                placeholder:pl-2 focus:outline-none
              w-[250px] h-[35px] border-2 border-[#83ACD8]"
                      type="text"
                    ></input>
                  ) : (
                    <p className=" font-poppins  ">{contact}</p>
                  )}
                </div>
                <div className="w-[350px]">
                  <p className="text-[#83ACD8] font-poppins ">Gender</p>
                  {editing ? (
                    <select
                      value={gender}
                      onChange={handleChangeGender}
                      className=" w-[250px]  text-[#4f4f4f] focus:outline-none pl-2  h-[35px] border-2 rounded-md border-[#83ACD8]"
                    >
                      <option className="font-poppins ">Male</option>
                      <option className="font-poppins">Female</option>
                    </select>
                  ) : (
                    <p className=" font-poppins  ">{gender}</p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex gap-5">
                <div className="w-[350px]">
                  <p className="text-[#83ACD8] font-poppins ">Student Number</p>
                  {editing ? (
                    <input
                      value={`${student_num}`}
                      onChange={handleChangeStudentNumber}
                      className="mt-1 
                pl-2 font-poppins text-[#434343] rounded-md
                placeholder:pl-2 focus:outline-none
              w-[250px] h-[35px] border-2 border-[#83ACD8]"
                      type="text"
                    ></input>
                  ) : (
                    <p className=" font-poppins  ">{student_num}</p>
                  )}
                </div>
                <div className="w-[350px]">
                  <p className="text-[#83ACD8] font-poppins ">Email</p>
                  {editing ? (
                    <input
                      value={`${email}`}
                      onChange={handleChangeEmail}
                      className="mt-1 
                pl-2 font-poppins text-[#434343] rounded-md
                placeholder:pl-2 focus:outline-none
              w-[250px] h-[35px] border-2 border-[#83ACD8]"
                      type="text"
                    ></input>
                  ) : (
                    <p className=" font-poppins  ">{email}</p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex gap-5">
                <div className="w-[350px]">
                  <p className="text-[#83ACD8] font-poppins ">Join Date</p>
                  <p className=" font-poppins  ">
                    {usr.createdAt.getDate()}/{usr.createdAt.getMonth() + 1}/
                    {usr.createdAt.getFullYear()}
                  </p>
                </div>
              </div>

              <div className="mt-5  w-[80%] flex justify-end ">
                {editing && (
                  <button
                    onClick={() => {
                      setLoading(true);
                      setEditing(false);
                      submit();
                    }}
                    className="bg-[#586ced]  items-center flex justify-center  gap-3 self-end p-2 w-[100px] rounded-md font-poppins text-white"
                  >
                    Update {loading && <Spinner color="green" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
