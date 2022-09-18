import {
  createContext,
  useContext,
  ParentComponent,
  createSignal,
  createResource,
  createEffect,
} from "solid-js";
import { createStore } from "solid-js/store";
import { supabase } from "@/fetch/supabaseClient";
import { Session } from "@supabase/supabase-js";
import { useLocation } from "solid-app-router";
import { ProjectData } from "@/state";

interface AuthState {
  session: Session;
  error: Error;
}

interface Actions {
  signin: (currentData: ProjectData) => void;
  signout: () => void;
}

const AuthContext = createContext<[state: AuthState, actions: Actions]>();

export const AuthProvider: ParentComponent = (props) => {
  const location = useLocation();
  const [session, setSession] = createSignal<Session>(null);

  const [signinTrigger, setSigninTrigger] = createSignal<"in" | "out" | false>(
    false
  );

  const [signinData] = createResource(signinTrigger, async (signing) => {
    if (signing === "in") {
      const redirectTo =
        (import.meta.env.DEV ? "http://localhost:8888" : "https://tutour.dev") +
        location.pathname;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          scopes: "repo",
          redirectTo,
        },
      });
      if (error) {
        throw error;
      }
      console.log(data);
      return data;
    }
    if (signing === "out") {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    }
  });

  supabase.auth.onAuthStateChange((event, session) => {
    setSession(session);
  });

  const actions: Actions = {
    signin(saveData: ProjectData) {
      //TODO: persist this saveData in localStorage so that we don't lose it upon redirect
      setSigninTrigger("in");
    },
    signout() {
      setSigninTrigger("out");
    },
  };

  const state = {
    get session() {
      return session();
    },
    get error() {
      return signinData.error;
    },
  };
  return (
    <AuthContext.Provider value={[state, actions]}>
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
