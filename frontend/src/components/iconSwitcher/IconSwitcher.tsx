import React from "react";

// Icons
import {
  MdOutlinePersonOutline,
  MdOutlineSearch,
  MdFavoriteBorder,
  MdOutlineAccountBalanceWallet,
  MdOutlineMouse,
  MdKeyboard,
  MdAddBox,
  MdOutlineCategory,
} from "react-icons/md";
import { ImHeadphones } from "react-icons/im";
import { GiProtectionGlasses } from "react-icons/gi";
import { TbDeviceGamepad2 } from "react-icons/tb";
import { RiComputerLine } from "react-icons/ri";
import { IoIosHelpBuoy } from "react-icons/io";
import { FaFantasyFlightGames, FaHandsHelping } from "react-icons/fa";

// Accepts a page name (e.g. "Profile") or a category slug (e.g. "mouse").
const IconSwitcher = ({ name }: { name: string }) => {
  switch (name) {
    case "Profile":
      return <MdOutlinePersonOutline aria-hidden />;
    case "Search":
      return <MdOutlineSearch aria-hidden />;
    case "Favorite":
      return <MdFavoriteBorder aria-hidden />;
    case "Balance":
      return <MdOutlineAccountBalanceWallet aria-hidden />;
    case "New product":
      return <MdAddBox aria-hidden />;
    case "mouse":
      return <MdOutlineMouse aria-hidden />;
    case "headphones":
      return <ImHeadphones aria-hidden />;
    case "gamepads":
      return <TbDeviceGamepad2 aria-hidden />;
    case "vr-glasses":
      return <GiProtectionGlasses aria-hidden />;
    case "keyboards":
      return <MdKeyboard aria-hidden />;
    case "computer":
      return <RiComputerLine aria-hidden />;
    case "games":
      return <FaFantasyFlightGames aria-hidden />;
    case "Help":
      return <FaHandsHelping aria-hidden />;
    case "Conditions":
      return <IoIosHelpBuoy aria-hidden />;
    default:
      return <MdOutlineCategory aria-hidden />;
  }
};

export default IconSwitcher;
