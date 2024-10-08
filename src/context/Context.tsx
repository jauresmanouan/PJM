import { createContext } from "react";

export default createContext({
  isClicked: false,
  setIsClicked: () => {},
  handleClicked: () => {},
} as {
  isClicked: boolean;
  setIsClicked: (value: boolean) => void;
  handleClicked: () => void;
});
