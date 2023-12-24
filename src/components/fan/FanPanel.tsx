import { PanelSection, PanelSectionRow, ToggleField } from 'decky-frontend-lib';
import { useCustomFanCurvesEnabled, useSupportsCustomFanCurves } from "../../hooks/fan"

const FanPanel = () => {
    const supportsFanCurves = useSupportsCustomFanCurves()

    const { enabled, setCustomFanCurvesEnabled } = useCustomFanCurvesEnabled()

    if(!supportsFanCurves) {
        return null
    }

    return (
        <PanelSection title="Fan Control">
            <PanelSectionRow>
            <ToggleField
                label={'Enable custom fan curves'}
                checked={enabled}
                onChange={setCustomFanCurvesEnabled}
            />
            </PanelSectionRow>
        </PanelSection>
    )
}

export default FanPanel