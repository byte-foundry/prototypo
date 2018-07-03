// This is used to get history outside of React components
// because of legacy code
// It would be preferable to use React Router features instead
import {createHashHistory} from 'history';

export default createHashHistory();
