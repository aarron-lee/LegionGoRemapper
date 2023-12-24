import { useDispatch, useSelector } from 'react-redux';
import { fanSlice, selectCustonFanCurvesEnabled, selectSupportsCustomFanCurves } from '../redux-modules/fanSlice';


export const useSupportsCustomFanCurves = () =>{
    const result = useSelector(selectSupportsCustomFanCurves)
    return result
}

export const useCustomFanCurvesEnabled = () => {
    const enabled = useSelector(selectCustonFanCurvesEnabled);
    const dispatch = useDispatch()

    const setter = (enabled: boolean) => {
        return dispatch(fanSlice.actions.setCustomFanCurvesEnabled(enabled))
    }

    return { enabled, setCustomFanCurvesEnabled: setter }
}