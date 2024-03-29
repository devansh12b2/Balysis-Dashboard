"use client";
import React, { useEffect, useState } from "react";
import { UserTable } from "@/components/ManualTrade/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { activeClientPositionsAPI } from "@/api/activePositions";
import { getManualSignals } from "@/api/getManualSignals";
import { AiOutlineCodeSandbox } from "react-icons/ai";
import Image from "next/image";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import TradeButton from "@/components/ManualTrade/tradeButton";
import { reverse } from "lodash";
import OpenOrders from "@/components/ManualTrade/OpenOrders";
import { DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";


const accounts = () => {
  const [daily, setDaily] = useState(true);
  // const [signals_data, setSignalsData] = useState([]);
  const [rowSelection, setRowSelection] = React.useState([]);
  const [data, setData] = useState([]);
  const [token, setToken] = useState("");
  const [refresh, setRefresh] = useState(true)
  const [squareoffuser, setSquareoffuser] = useState({})

  const columns = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      header: "ID",
      accessorKey: "id",
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: ({ cell, row }) => (
        <div className="flex flex-row items-center">
          <Image
            className="rounded-full"
            src="/images/dummy.png"
            width={40}
            height={40}
          />
          <a
            className="ml-2 hover:underline"
            href={`/clientpositions/${row.original.id}?name=${row.original.name}`}
          >
            {cell.getValue()}
          </a>
        </div>
      ),
    },
    {
      header: "Broker",
      accessorKey: "broker",
      cell: ({ cell }) => {
        const broker = cell.getValue();
        if (broker === "fyers") {
          return (
            <div>
              <Image
                className="rounded-full"
                src="/images/fyers.jpeg"
                width={40}
                height={40}
              />
            </div>
          );
        }
        if (broker === "jmfinancials") {
          return (
            <div>
              <Image
                className="rounded-full"
                src="/images/jmfinancial.png"
                width={40}
                height={40}
              />
            </div>
          );
        }
        if (broker === "iifl") {
          return (
            <div>
              <Image
                className="rounded-full"
                src="/images/iifllogo.jpeg"
                width={40}
                height={40}
              />
            </div>
          );
        } else {
          return (
            <Image
              className="rounded-full"
              src="/images/zerodhalogo.avif"
              width={40}
              height={40}
            />
          );
        }
      },
    },
    {
      header: "Margin",
      accessorKey: "margin",
    },
    {
      header: "Unrealized PnL",
      accessorKey: "unrealized",
    },
    {
      header: "Realized PnL",
      accessorKey: "realized",
    },
    {
      header: "No. of Strategies",
      accessorKey: "no_strategies",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex flex-row items-center">
          <DialogTrigger asChild>
            <Button variant="destructive" onClick={() => setSquareoffuser({ id: row.original.id, name: row.original.name })}>Square Off</Button>
          </DialogTrigger>
        </div>
      ),
    },
  ];

  async function callAPI(token) {

    const resp = await activeClientPositionsAPI(token, daily);
    console.log(resp);
    let data = [];

    for (const x in resp.userPnl) {
      const obj = resp.userPnl[x];
      data.push({
        id: x,
        name: obj.name,
        broker: obj.broker,
        margin: parseFloat(obj.margin.total).toFixed(2),
        unrealized: parseFloat(obj.total_unrealised_pnl).toFixed(2),
        realized: parseFloat(obj.total_realised_pnl).toFixed(2),
        no_strategies: obj.subscribed_strategies - 1,
      });
    }
    setData(data);
  }
  async function checkLogin() {
    if (localStorage.getItem("token") === null) {
      console.log("No token found");
      window.location.href = "/login";
    } else {
      console.log("token found");
      const tk = localStorage.getItem("token");
      setToken(tk);
      return tk;
    }
  }
  useEffect(() => {
    checkLogin().then((token) => {
      callAPI(token);
    });
    const interval = setInterval(() => {
      checkLogin().then((token) => {
        callAPI(token, daily);
      });
    }, 3000);
    return () => {
      clearInterval(interval);
    };
  }, [daily]);

  return (
    <div className="h-screen w-full mx-8 overflow-auto">
      <h1 className="text-4xl font-semibold mt-10">Manual Trade</h1>
      <div className="flex">
        <div className="my-4 inline-block">
          <TradeButton rowSelection={rowSelection} data={data} refresh={refresh} setRefresh={setRefresh} />
        </div>
        <a
          href="/sets"
          className="flex my-4 bg-[#41AFFF] text-white py-1 px-4 rounded-lg ml-4"
        >
          <AiOutlineCodeSandbox className="mt-1" />
          Sets
        </a>
      </div>
      <div>
        <Tabs
          defaultValue="daily"
          value={daily ? "daily" : "alltime"}
          onValueChange={(e) => {
            setDaily(e === "daily");
          }}
          className="w-[400px]"
        >
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="alltime">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <UserTable
        columns={columns}
        data={data}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        squareoffuser={squareoffuser}
        token={token}
      />
      <h1 className="text-4xl font-semibold mt-10 mb-2">Open Orders</h1>
      <OpenOrders refresh={refresh} setRefresh={setRefresh} />
    </div>
  );
};

export default accounts;
