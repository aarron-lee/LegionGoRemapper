import { useDispatch, useSelector } from 'react-redux';
import { selectSupportsCustomFanCurves } from '../redux-modules/fanSlice';


export const useSupportsCustomFanCurves = () =>{
    const result = useSelector(selectSupportsCustomFanCurves)
    return result
}