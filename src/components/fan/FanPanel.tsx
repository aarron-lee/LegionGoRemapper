import { useEffect } from 'react';
import { PanelSection, PanelSectionRow, ToggleField } from 'decky-frontend-lib';
import { useCustomFanCurvesEnabled, useFanPerGameProfilesEnabled, useSupportsCustomFanCurves } from "../../hooks/fan"
import { capitalize } from 'lodash';
import { extractDisplayName } from '../../backend/utils';
import { useSelector } from 'react-redux';
import { selectCurrentGameId } from '../../redux-modules/uiSlice';

const useTitle = (fanPerGameProfilesEnabled: boolean) => {
    const currentGameId = useSelector(selectCurrentGameId)

    let displayName = 'default';

    useEffect(() => {
        displayName = fanPerGameProfilesEnabled ? extractDisplayName() : 'default'
    }, [fanPerGameProfilesEnabled, currentGameId])

    if(!fanPerGameProfilesEnabled) {
        return 'Fan Control'
    }

    const title = `Fan Control - ${capitalize(displayName)}`;

    return title
}

const FanPanel = () => {
    const supportsFanCurves = useSupportsCustomFanCurves()

    const { customFanCurvesEnabled, setCustomFanCurvesEnabled } = useCustomFanCurvesEnabled()
    const { fanPerGameProfilesEnabled, setFanPerGameProfilesEnabled } = useFanPerGameProfilesEnabled()
    const title = useTitle(fanPerGameProfilesEnabled)

    if(!supportsFanCurves) {
        return null
    }

    return (
        <PanelSection title={title}>
            <PanelSectionRow>
                <ToggleField
                    label={'Enable Custom Fan Curves'}
                    checked={customFanCurvesEnabled}
                    onChange={setCustomFanCurvesEnabled}
                />
            </PanelSectionRow>
            {
                customFanCurvesEnabled && (
                    <>
                        <PanelSectionRow>
                            <ToggleField
                                label={'Enable Per Game Fan Curves'}
                                checked={fanPerGameProfilesEnabled}
                                onChange={setFanPerGameProfilesEnabled}
                            />
                        </PanelSectionRow>
                    </>
                )
            }
        </PanelSection>
    )
}

export default FanPanel