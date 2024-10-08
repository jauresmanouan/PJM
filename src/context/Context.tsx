import { createContext } from "react";

export default createContext({
  isClicked: false,
  setIsClicked: () => {},
  handleClicked: () => {},
});
