"use client";
import { getStrategyNotes } from "@/api/getStrategyNotes";
import { getStrategySignals } from "@/api/getStrategySignals";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateStrategyNote } from "@/api/updateStrategyNote";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import _ from "lodash";
import moment from "moment";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { squareOffStrategy } from "@/api/squareOffStrategy";
import AlgoOrderbook from "@/components/AlgoTrade/AlgoOrderbook";

export default function StrategyBox({
  id,
  name,
  total_unrealised_pnl,
  total_realised_pnl,
  active,
  start,
  end,
}) {
  const [signals, setSignals] = useState([]);
  const [daily, setDaily] = useState(true);
  const [notes, setNotes] = useState("");
  const [token, setToken] = useState("");
  const [otp, setOTP] = useState("");
  async function checkLogin() {
    if (localStorage.getItem("token") === null) {
      window.location.href = "/login";
    } else {
      const tk = localStorage.getItem("token");
      setToken(tk);
      return tk;
    }
  }
  useEffect(() => {
    checkLogin().then((token) => {
      getStrategySignals(name, token, start, end).then((data) => {
        console.log(data);
        setSignals(data);
      });
      getStrategyNotes(token, name).then((data) => {
        setNotes(data["notes"] || "");
      });
    });
  }, [start, end]);
  async function squareOffStrategyForToday() {
    const pms = new Promise((resolve, reject) => {
      squareOffStrategy(token, id, name, false, otp).then((res) => {
        if (res.status === 200) {
          resolve(res);
        } else {
          reject(res);
        }
      });
    });
    toast.promise(pms, {
      loading: "Square Off in Progress",
      success: "Strategy Square Off Successful",
      error: "Strategy Square Off Failed",
    });
  }
  async function shutdownStrategy() {
    const pms = new Promise((resolve, reject) => {
      squareOffStrategy(token, id, name, true, otp).then((res) => {
        if (res.status === 200) {
          resolve(res);
        } else {
          reject(res);
        }
      });
    });
    toast.promise(pms, {
      loading: "Shutting Down Strategy in Progress",
      success: "Strategy Shutdown Successful",
      error: "Strategy Shutdown Failed",
    });
    // const res = await squareOffStrategy(token, id, name, true, otp);
    // if (res.status === 200) {
    //   toast.success("Strategy Square Off Successful");
    // } else {
    //   toast.error("Strategy Square Off Failed");
    // }
  }
  return (
    <div className="mx-12 bg-white mt-8 rounded-md shadow-md">
      <div className="mx-8 grid grid-cols-12 py-4">
        <a
          className="col-span-7 text-3xl font-bold hover:underline"
          href={`/algotrade/${name}?strategy_name=${name}`}
        >
          {name}
          {active == 0 ? (
            <span className="ml-2 border-red-900 text-sm text-red-500">
              INACTIVE
            </span>
          ) : (
            <span className="ml-2 text-sm text-green-500">
              Active Users = {active}
            </span>
          )}
        </a>
        <div className="col-span-5 flex flex-row justify-between">
          <div
            className={
              "font-semibold " +
              (total_unrealised_pnl < 0 ? "text-red-500" : "text-green-500")
            }
          >
            {total_unrealised_pnl.toFixed(2)}
          </div>
          <div
            className={
              "font-semibold " +
              (total_realised_pnl < 0 ? "text-red-500" : "text-green-500")
            }
          >
            {total_realised_pnl.toFixed(2)}
          </div>
          <div
            className={
              "font-semibold pr-2 " +
              (total_realised_pnl + total_unrealised_pnl < 0
                ? "text-red-500"
                : "text-green-500")
            }
          >
            {(total_realised_pnl + total_unrealised_pnl).toFixed(2)}
          </div>
        </div>
      </div>
      <div className="mx-8 flex flex-row pb-4">
        <div className="basis-5/6 flex flex-row">
          <AlgoOrderbook />
          <Dialog>
            <DialogTrigger asChild>
              <button className="bg-[#41AFFF] text-white shadow-sm py-2 px-6 mx-2 rounded-md">
                Square Off Today
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>Square Off Strategy for Today</DialogHeader>
              <div className="flex gap-4">
                <p>Enter PIN - </p>
                <InputOTP maxLength={6} value={otp} onChange={setOTP}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button variant="addUser" onClick={squareOffStrategyForToday}>
                Confirm
              </Button>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              {/* <button className="bg-[#41AFFF] text-white shadow-sm py-2 px-6 mx-2 rounded-md"> */}
              {/*   Square Off Today */}
              {/* </button> */}
              <button className="bg-[#41AFFF] text-white shadow-sm py-2 px-6 mx-2 rounded-md">
                Shutdown
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>Shutdown Strategy</DialogHeader>
              <div className="flex gap-4">
                <p>Enter PIN- </p>
                <InputOTP maxLength={6} value={otp} onChange={setOTP}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button variant="addUser" onClick={shutdownStrategy}>
                Confirm
              </Button>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <button className="bg-[#41AFFF] text-white shadow-sm py-2 px-6 mx-2 rounded-md">
                Notes
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[825px] max-h-[1000px] overflow-auto">
              <DialogHeader>
                <DialogTitle>Notes</DialogTitle>
              </DialogHeader>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button
                variant="addUser"
                onClick={() =>
                  updateStrategyNote(token, name, notes).then(() => {
                    toast("Updated");
                  })
                }
              >
                Update
              </Button>
            </DialogContent>
          </Dialog>
          {/* <button className="bg-[#41AFFF] text-white shadow-sm py-2 px-6 mx-2 rounded-md"> */}
          {/*   Notes */}
          {/* </button> */}
        </div>
      </div>
    </div>
  );
}
