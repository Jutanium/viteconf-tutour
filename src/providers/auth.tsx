import {
  createContext,
  useContext,
  ParentComponent,
  createSignal,
  createResource,
} from "solid-js";
import { createStore } from "solid-js/store";
import { supabase } from "@/data/supabaseClient";
import { Session } from "@supabase/supabase-js";

supabase.auth.getSession();

interface AuthState {
  session: Session;
  error: Error;
}

interface Actions {
  signin: () => void;
  signout: () => void;
}

const AuthContext = createContext<[state: AuthState, actions: Actions]>();

export const AuthProvider: ParentComponent = (props) => {
  const [session, setSession] = createSignal<Session>(null);

  const [signinTrigger, setSigninTrigger] = createSignal<"in" | "out" | false>(
    false
  );

  const [signinData] = createResource(signinTrigger, async (signing) => {
    if (signing === "in") {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
      });
      if (error) {
        throw error;
      }
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
    console.log(event, session);
    console.log(session?.user);
    setSession(session);
  });

  const actions: Actions = {
    signin() {
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
