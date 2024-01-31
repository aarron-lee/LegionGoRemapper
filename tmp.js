class p {
  static Get() {
    return (
      null == p.s_Singleton &&
        ((p.s_Singleton = new p()), (window.SystemPerfStore = p.s_Singleton)),
      p.s_Singleton
    );
  }
  get msgDiagnosticInfo() {
    return this.m_msgDiagnosticInfo;
  }
  get msgState() {
    return this.m_msgState;
  }
  get msgLimits() {
    var e;
    return null === (e = this.m_msgState) || void 0 === e ? void 0 : e.limits;
  }
  get msgSettingsGlobal() {
    var e, t;
    return null ===
      (t =
        null === (e = this.m_msgState) || void 0 === e ? void 0 : e.settings) ||
      void 0 === t
      ? void 0
      : t.global;
  }
  get msgSettingsPerApp() {
    var e, t;
    return null ===
      (t =
        null === (e = this.m_msgState) || void 0 === e ? void 0 : e.settings) ||
      void 0 === t
      ? void 0
      : t.per_app;
  }
  get nCurrentGameID() {
    return this.msgState.current_game_id;
  }
  get nActiveProfileGameID() {
    return this.msgState.active_profile_game_id;
  }
  get nBatteryTemperatureC() {
    var e;
    return null === (e = this.msgDiagnosticInfo) || void 0 === e
      ? void 0
      : e.battery_temp_c;
  }
  constructor() {
    var e, t;
    (this.m_msgDiagnosticInfo = {}),
      (this.m_msgState = {}),
      (0, i.makeObservable)(this),
      null === (e = SteamClient.System.Perf) ||
        void 0 === e ||
        e.RegisterForDiagnosticInfoChanges(this.OnDiagnosticInfoChanged),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.RegisterForStateChanges(this.OnStateChanged);
  }
  OnDiagnosticInfoChanged(e) {
    const t = c.y2.deserializeBinary(e).toObject();
    Object.keys(t).forEach((e) => (this.m_msgDiagnosticInfo[e] = t[e])),
      void 0 !== this.nBatteryTemperatureC &&
        A.Xo.OnBatteryTemperatureChange(this.nBatteryTemperatureC);
  }
  OnStateChanged(e) {
    const t = c.Hm.deserializeBinary(e).toObject();
    Object.keys(t).forEach((e) => (this.m_msgState[e] = t[e]));
  }
  CreateSettingsUpdateRequest(e = null) {
    null == e && (e = this.nActiveProfileGameID);
    let t = new c.Eh();
    return t.set_gameid(e.toString()), t;
  }
  SetDiagnosticUpdateRate(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().global(!0).set_diagnostic_update_rate(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetSystemTracingEnabled(e) {
    var t;
    const n = e ? 2 : 1;
    let o = this.CreateSettingsUpdateRequest();
    o.settings_delta().global(!0).set_system_trace_service_state(n),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(o.serializeBase64String());
  }
  SetGraphicsProfilingEnabled(e) {
    var t;
    const n = e ? 2 : 1;
    let o = this.CreateSettingsUpdateRequest();
    o.settings_delta().global(!0).set_graphics_profiling_service_state(n),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(o.serializeBase64String());
  }
  SetPerfOverlayEnabled(e) {
    var t;
    const n = e ? 2 : 1;
    let o = this.CreateSettingsUpdateRequest();
    o.settings_delta().global(!0).set_perf_overlay_service_state(n),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(o.serializeBase64String());
  }
  SetPerfOverlayLevel(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().global(!0).set_perf_overlay_level(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetShowPerfOverlayOverSteamEnabled(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n
      .settings_delta()
      .global(!0)
      .set_is_show_perf_overlay_over_steam_enabled(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetGPUPerformanceLevel(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().per_app(!0).set_gpu_performance_level(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetGPUPerformanceManualMhz(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().per_app(!0).set_gpu_performance_manual_mhz(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetFPSLimitEnabled(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().per_app(!0).set_is_fps_limit_enabled(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetFPSLimit(e, t) {
    var n;
    let o = this.CreateSettingsUpdateRequest();
    e
      ? o.settings_delta().per_app(!0).set_fps_limit_external(Math.round(t))
      : o.settings_delta().per_app(!0).set_fps_limit(Math.round(t)),
      null === (n = SteamClient.System.Perf) ||
        void 0 === n ||
        n.UpdateSettings(o.serializeBase64String());
  }
  SetVariableResolutionEnabled(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().per_app(!0).set_is_variable_resolution_enabled(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetDynamicRefreshRateEnabled(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().per_app(!0).set_is_dynamic_refresh_rate_enabled(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetTDPLimitEnabled(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().per_app(!0).set_is_tdp_limit_enabled(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetTDPLimit(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().per_app(!0).set_tdp_limit(Math.round(e)),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetCPUGovernor(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().per_app(!0).set_cpu_governor(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetCPUGovernorManualMhz(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().per_app(!0).set_cpu_governor_manual_mhz(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetScalingFilter(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().per_app(!0).set_scaling_filter(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetFSRSharpness(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().per_app(!0).set_fsr_sharpness(Math.round(e)),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetNISSharpness(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().per_app(!0).set_nis_sharpness(Math.round(e)),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetLowLatencyModeEnabled(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().per_app(!0).set_is_low_latency_mode_enabled(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetDisplayRefreshRateManualHz(e, t) {
    var n;
    let o = this.CreateSettingsUpdateRequest();
    e
      ? o.settings_delta().per_app(!0).set_display_external_refresh_manual_hz(t)
      : o.settings_delta().per_app(!0).set_display_refresh_manual_hz(t),
      null === (n = SteamClient.System.Perf) ||
        void 0 === n ||
        n.UpdateSettings(o.serializeBase64String());
  }
  SaveGameProfile() {
    var e;
    const t = c.NX.fromObject(this.msgState.settings);
    let n = this.CreateSettingsUpdateRequest(this.nCurrentGameID);
    n.set_settings_delta(t),
      null === (e = SteamClient.System.Perf) ||
        void 0 === e ||
        e.UpdateSettings(n.serializeBase64String());
  }
  SetGameSpecificProfileEnabled(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest(this.nCurrentGameID);
    n.settings_delta().per_app(!0).set_is_game_perf_profile_enabled(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetAdvancedSettingsEnabled(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().global(!0).set_is_advanced_settings_enabled(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetDisplayOCEnabled(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().global(!0).set_is_display_oc_enabled(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  ResetCurrentPerfProfileSettings() {
    var e;
    let t = this.CreateSettingsUpdateRequest();
    t.set_reset_to_default(!0),
      null === (e = SteamClient.System.Perf) ||
        void 0 === e ||
        e.UpdateSettings(t.serializeBase64String());
  }
  SetAllowExternalDisplayRefreshControl(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().global(!0).set_allow_external_display_refresh_control(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetColorManagmentEnabled(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().global(!0).set_is_color_management_enabled(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetTearingEnabled(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().per_app(!0).set_is_tearing_enabled(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetVRREnabled(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().per_app(!0).set_is_vrr_enabled(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetCompositeDebugEnabled(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().per_app(!0).set_is_composite_debug_enabled(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetForceComposite(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().per_app(!0).set_force_composite(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetUseDynamicRefreshRateInSteam(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().per_app(!0).set_use_dynamic_refresh_rate_in_steam(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetSplitScalingFilter(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().per_app(!0).set_split_scaling_filter(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetSplitScalingScaler(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().per_app(!0).set_split_scaling_scaler(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetHDREnabled(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().global(!0).set_is_hdr_enabled(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetHDRDebugForce10PQOutput(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().global(!0).set_force_hdr_10pq_output_debug(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetHDROnSDRTonemapOperator(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().global(!0).set_hdr_on_sdr_tonemap_operator(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetHDRDebugHeatmapEnabled(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().global(!0).set_is_hdr_debug_heatmap_enabled(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetHDRDebugForceHDRSupport(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().global(!0).set_debug_force_hdr_support(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetHDRSDRContentBrightness(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().global(!0).set_sdr_to_hdr_brightness(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
  SetHDREnableExperimentalSupport(e) {
    var t;
    let n = this.CreateSettingsUpdateRequest();
    n.settings_delta().global(!0).set_allow_experimental_hdr(e),
      null === (t = SteamClient.System.Perf) ||
        void 0 === t ||
        t.UpdateSettings(n.serializeBase64String());
  }
}
