import { computed, isSignal } from "@tldraw/state";
import { useAtom } from "@tldraw/state-react";
import { useEffect, useMemo } from "react";
import { useShallowObjectIdentity } from "../hooks/useIdentity.mjs";
import { getUserPreferences, setUserPreferences } from "./TLUserPreferences.mjs";
const defaultLocalStorageUserPrefs = computed(
  "defaultLocalStorageUserPrefs",
  () => getUserPreferences()
);
function createTLCurrentUser(opts = {}) {
  return {
    userPreferences: opts.userPreferences ?? defaultLocalStorageUserPrefs,
    setUserPreferences: opts.setUserPreferences ?? setUserPreferences
  };
}
function useTldrawCurrentUser(opts) {
  const prefs = useShallowObjectIdentity(opts.userPreferences ?? defaultLocalStorageUserPrefs);
  const userAtom = useAtom("userAtom", prefs);
  useEffect(() => {
    userAtom.set(prefs);
  }, [prefs, userAtom]);
  return useMemo(
    () => createTLCurrentUser({
      userPreferences: computed("userPreferences", () => {
        const userStuff = userAtom.get();
        return isSignal(userStuff) ? userStuff.get() : userStuff;
      }),
      setUserPreferences: opts.setUserPreferences
    }),
    [userAtom, opts.setUserPreferences]
  );
}
export {
  createTLCurrentUser,
  useTldrawCurrentUser
};
//# sourceMappingURL=createTLCurrentUser.mjs.map
