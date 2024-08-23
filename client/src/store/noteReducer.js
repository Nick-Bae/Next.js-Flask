// reducers/noteReducer.js
const initialState = {
    notes: [],
    loading: false,
    error: null,
  };
  
  function noteReducer(state = initialState, action) {
    switch (action.type) {
      case 'ADD_NOTE':
        return {
          ...state,
          notes: [...state.notes, action.payload],
        };
      // Handle other actions
      default:
        return state;
    }
  }
  
  export default noteReducer;
  