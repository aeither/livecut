import { getHuddleClient } from "@huddle01/huddle01-client";
import { createContext } from "react";

type HuddleClient = {
  huddleClient: ReturnType<typeof getHuddleClient>;
};

export const StateContext = createContext<HuddleClient>({} as HuddleClient);
