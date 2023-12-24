import { PanelSection, PanelSectionRow, ToggleField } from 'decky-frontend-lib';
import { useSupportsCustomFanCurves } from "../../hooks/fan"

const FanPanel = () => {
    const supportsFanCurves = useSupportsCustomFanCurves()

    if(!supportsFanCurves) {
        return null
    }

    return (
        <PanelSection title="Custom Fan Curves">
            <PanelSectionRow>
            {/* <ToggleField
                label={'Enable controller remaps'}
                checked={controllerRemappingEnabled}
                onChange={setControllerRemappingEnabled}
            /> */}
            </PanelSectionRow>
        </PanelSection>
    )
}

export default FanPanel