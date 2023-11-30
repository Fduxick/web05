import { createStore } from "vuex";

import { initializeApp } from "firebase/app";
import {
  getDocs,
  getDoc,
  collection,
  doc,
  // deleteDoc,
  getFirestore,
  setDoc,
} from "firebase/firestore";

import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBK_FiBcwgilswhX5e0C416R0VjLL3D1EY",
  authDomain: "web4-95dfa.firebaseapp.com",
  projectId: "web4-95dfa",
  storageBucket: "web4-95dfa.appspot.com",
  messagingSenderId: "457799809234",
  appId: "1:457799809234:web:2bba90097784fa6709d50b",
  measurementId: "G-2B3XQQ3GK3",
};

const APP = initializeApp(firebaseConfig);

const DB = getFirestore(APP);
const AUTH = getAuth(APP);

export default createStore({
  state: () => ({
    uid: null,
    board: { notes: [] },
    categories: [],
    checkedCategories: [],
    isLoggedIn: false,
  }),

  getters: {
    filteredNotes(state) {
      return state.board.notes.filter((el) => {
        if (state.checkedCategories.length > 0) {
          return state.checkedCategories.includes(String(el.categorie));
        }
        return state.board.notes;
      });
    },
  },

  mutations: {
    setUid(state, data) {
      state.uid = data;
    },

    setIsLoggedIn(state, data) {
      state.isLoggedIn = data;
    },

    setLs(state, data) {
      const { uid, isLoggedIn } = data;

      state.uid = uid;
      state.isLoggedIn = isLoggedIn;
    },

    setBoard(state, data) {
      if (!data) {
        return;
      }

      state.board = data;
    },

    addNotes(state, data) {
      state.board.notes.push(data);
    },

    addCategories(state, data) {
      state.categories.push(data);
    },

    updateNote(state, data) {
      const idx = state.board.notes.findIndex((el) => el.id === data.id);
      state.board.notes.splice(idx, 1, data);
    },

    deleteNote(state, data) {
      const idx = state.board.notes.findIndex((el) => el.id === data.id);
      state.board.notes.splice(idx, 1);
    },

    checkCategorie(state, data) {
      state.checkedCategories.push(data);
    },

    unCheckCategorie(state, data) {
      const idx = state.checkedCategories.indexOf(data);
      state.checkedCategories.splice(idx, 1);
    },
  },

  actions: {
    async SignUp({ commit }, data) {
      await createUserWithEmailAndPassword(AUTH, data.email, data.password)
        .then((data) => {
          commit("setUid", data.user.uid);
          commit("setIsLoggedIn", true);

          localStorage.setItem("isLoggedIn", true);
          localStorage.setItem("uid", data.user.uid);
        })
        .catch((error) => {
          console.log(error);
        });
    },

    async SignIn({ commit }, data) {
      await signInWithEmailAndPassword(AUTH, data.email, data.password)
        .then((data) => {
          commit("setUid", data.user.uid);
          commit("setIsLoggedIn", true);

          localStorage.setItem("isLoggedIn", true);
          localStorage.setItem("uid", data.user.uid);
        })
        .catch((error) => {
          console.log(error);
        });
    },

    async SignOut({ state }) {
      await signOut(AUTH);
      state.uid = null;
      state.isLoggedIn = null;
      state.categories = [];
      state.board.notes = [];
      localStorage.removeItem("uid");
      localStorage.removeItem("isLoggedIn");
    },

    fetchCategories({ commit, state }) {
      state.categories = [];
      getDocs(collection(DB, "Categories")).then((res) =>
        res.forEach((el) => commit("addCategories", el.data()))
      );
    },

    fetchNotes({ commit, state }) {
      state.board.notes = [];
      getDoc(doc(DB, "Boards", state.uid)).then((res) =>
        commit("setBoard", res?.data())
      );
    },

    setLs({ commit }, data) {
      commit("setLs", data);
    },

    addNote({ commit, state }, data) {
      commit("addNotes", data);
      setDoc(doc(DB, "Boards", `${data.uid}`), state.board);
    },

    updateNote({ commit, state }, data) {
      commit("updateNote", data);
      setDoc(doc(DB, "Boards", `${data.uid}`), state.board);
    },

    deleteNote({ commit, state }, data) {
      commit("deleteNote", data);
      setDoc(doc(DB, "Boards", `${data.uid}`), state.board);
    },

    checkCategorie({ commit }, data) {
      commit("checkCategorie", data);
    },

    unCheckCategorie({ commit }, data) {
      commit("unCheckCategorie", data);
    },
  },
});
