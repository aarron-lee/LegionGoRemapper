import { PanelSection, PanelSectionRow, ToggleField } from 'decky-frontend-lib';
import { useCustomFanCurvesEnabled, useFanPerGameProfilesEnabled, useSupportsCustomFanCurves } from "../../hooks/fan"

const FanPanel = () => {
    const supportsFanCurves = useSupportsCustomFanCurves()

    const { customFanCurvesEnabled, setCustomFanCurvesEnabled } = useCustomFanCurvesEnabled()
    const { fanPerGameProfilesEnabled, setFanPerGameProfilesEnabled } = useFanPerGameProfilesEnabled()

    if(!supportsFanCurves) {
        return null
    }

    return (
        <PanelSection title="Fan Control">
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