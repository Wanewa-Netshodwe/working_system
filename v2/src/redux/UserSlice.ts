import { createSlice } from "@reduxjs/toolkit";

export type UserState = {
  id: number;
  fullName: string;
  surname: string;
  password: string;
  contactNo: string;
  emailAddress: string;
  studentNumber: string;
  gender: string;
  createdAt: Date;
  profile_pic: string;
  clocked_in: boolean;
  new_account: boolean;
  department: string;
  job: string;
};

type workHours = {
  hours: number;
  minutes: number;
  seconds: number;
};

type AttendanceData = {
  clock_in: Date;
  clock_out: Date;
  todayDate: Date;
  workHours: workHours;
};

const initialState: UserState = {
  department: "",
  job: "",
  new_account: true,
  id: 0,
  clocked_in: false,
  profile_pic: "",
  fullName: "",
  surname: "",
  password: "",
  contactNo: "",
  emailAddress: "",
  studentNumber: "",
  gender: "",
  createdAt: new Date(),
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserDetails: (state, action) => {
      state.fullName = action.payload.fullName;
      state.surname = action.payload.surname;
      state.password = action.payload.password;
      state.contactNo = action.payload.contactNo;
      state.gender = action.payload.gender;
      state.studentNumber = action.payload.studentNumber;
      state.emailAddress = action.payload.emailAddress;
      state.new_account = action.payload.new_account;
      state.department = action.payload.department;
      state.job = action.payload.job;
      state.profile_pic = action.payload.profile_pic;
    },
    setClockin: (state, action) => {
      state.clocked_in = action.payload;
    },
  },
});

// Export the actions
export const { setUserDetails, setClockin } = userSlice.actions;

// Export the reducer to be added to the store
export default userSlice.reducer;
