import React from "react";

// Icons
import {
  MdOutlinePersonOutline,
  MdOutlineSearch,
  MdFavoriteBorder,
  MdOutlineAccountBalanceWallet,
  MdOutlineMouse,
  MdKeyboard,
} from "react-icons/md";
import { ImHeadphones } from "react-icons/im";
import { GiProtectionGlasses } from "react-icons/gi";
import { TbDeviceGamepad2 } from "react-icons/tb";
import { RiComputerLine } from "react-icons/ri";
import { IoIosHelpBuoy } from "react-icons/io";
import { FaFantasyFlightGames, FaHandsHelping } from "react-icons/fa";

const IconSwitcher = ({ name }: { name: string }) => {
  switch (name) {
    case "Profile":
      return <MdOutlinePersonOutline />;
    case "Search":
      return <MdOutlineSearch />;
    case "Favorite":
      return <MdFavoriteBorder />;
    case "Balance":
      return <MdOutlineAccountBalanceWallet />;
    case "Computer Mouse":
      return <MdOutlineMouse />;
    case "Game Headphones":
      return <ImHeadphones />;
    case "GamePads":
      return <TbDeviceGamepad2 />;
    case "VR Glasses":
      return <GiProtectionGlasses />;
    case "Keyboards":
      return <MdKeyboard />;
    case "Computer":
      return <RiComputerLine />;
    case "Games":
      return <FaFantasyFlightGames />;
    case "Help":
      return <FaHandsHelping />;
    case "Conditions":
      return <IoIosHelpBuoy />;
    default:
      return <FaFantasyFlightGames />;
  }
};

export default IconSwitcher;
