// app.jsx — Atrium main app

const TWEAK_DEFAULTS = {
  dark: false,
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useState("dashboard");
  const [railOpen, setRailOpen] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [userId, setUserId] = useState("aisyah");

  const currentUser = USERS[userId];
  const role = ROLES[currentUser.role];

  useEffect(() => {
    document.body.classList.toggle("dark", !!t.dark);
  }, [t.dark]);

  const navigate = (r) => {
    if (r === "wizard") { setWizardOpen(true); return; }
    setRoute(r);
  };

  // Build breadcrumb trail
  let trail = ["Atrium"];
  if (route === "dashboard") trail = ["Atrium", "Dashboard"];
  else if (route === "events") trail = ["Atrium", "Events"];
  else if (route.startsWith("event:")) {
    const e = EVENTS.find(x => x.id === route.split(":")[1]);
    trail = ["Atrium", "Events", e ? e.code : "—"];
  } else if (route === "tasks") trail = ["Atrium", "Tasks"];
  else if (route === "timeline") trail = ["Atrium", "Timeline"];
  else if (route === "org") trail = ["Atrium", "Org Chart"];
  else if (route === "team") trail = ["Atrium", "Team"];
  else if (route === "sponsors") trail = ["Atrium", "Sponsors"];
  else if (route === "budget") trail = ["Atrium", "Budget"];
  else if (route === "invoices") trail = ["Atrium", "Invoices & Claims"];
  else if (route === "approvals") trail = ["Atrium", "Approvals"];
  else if (route === "reports") trail = ["Atrium", "Reports & SWOT"];
  else if (route === "files") trail = ["Atrium", "Files"];
  else if (route === "draw") trail = ["Atrium", "Lucky Draw"];
  else if (route === "inventory") trail = ["Atrium", "Inventory"];
  else if (route.startsWith("item:")) {
    const i = INVENTORY.find(x => x.id === route.split(":")[1]);
    trail = ["Atrium", "Inventory", i ? i.name : "—"];
  }
  else if (route === "registration") trail = ["Atrium", "Code Sprint 2027", "Registration"];
  else if (route === "profile") trail = ["Atrium", "Profile"];

  let active = route.startsWith("event:") ? "events" : route.startsWith("item:") ? "inventory" : route;

  // Permission guard
  const routeToPerm = {
    dashboard: "view:dashboard", events: "view:events", tasks: "view:tasks",
    timeline: "view:timeline", org: "view:org", team: "view:team",
    sponsors: "view:sponsors", budget: "view:budget", invoices: "view:invoices",
    approvals: "view:approvals", reports: "view:reports", files: "view:files",
    draw: "view:draw", inventory: "view:events", registration: "view:registration",
  };
  const perm = routeToPerm[route] || null;
  const allowed = !perm || hasPermission(role, perm);

  return (
    <div className={"app" + (railOpen ? "" : " rail-collapsed")}>
      <Sidebar active={active} onNavigate={navigate} currentUser={currentUser} />

      <main className="main">
        <Topbar
          trail={trail}
          railOpen={railOpen}
          onToggleRail={() => setRailOpen(v => !v)}
          actions={
            <RoleBadgeButton currentUser={currentUser} onClick={() => navigate("profile")} />
          }
        />

        {!allowed ? (
          <div className="view view-narrow">
            <LockedFeature
              title="You don't have access to this page"
              body="This area requires a permission your current role doesn't grant. Your active role is "
              role={role.label}
            />
          </div>
        ) : (
          <>
            {route === "dashboard"          && <DashboardView onNavigate={navigate} />}
            {route === "events"             && <EventsView onNavigate={navigate} />}
            {route.startsWith("event:")     && <EventDetailView eventId={route.split(":")[1]} onNavigate={navigate} />}
            {route === "tasks"              && <TasksView />}
            {route === "timeline"           && <TimelineView />}
            {route === "org"                && <OrgView />}
            {route === "team"               && <TeamView />}
            {route === "sponsors"           && <SponsorsView />}
            {route === "budget"             && <BudgetView />}
            {route === "invoices"           && <InvoicesView />}
            {route === "approvals"          && <ApprovalsView />}
            {route === "reports"            && <ReportsView />}
            {route === "files"              && <FilesView currentUser={currentUser} />}
            {route === "draw"               && <LuckyDrawView />}
            {route === "inventory"          && <InventoryView onOpenItem={(id) => navigate("item:" + id)} />}
            {route.startsWith("item:")      && <ItemDetailView itemId={route.split(":")[1]} onBack={() => navigate("inventory")} />}
            {route === "registration"       && <RegistrationView currentUser={currentUser} />}
            {route === "profile"            && <ProfileView currentUser={currentUser} onSwitch={setUserId} />}
          </>
        )}
      </main>

      {railOpen && <AIRail onClose={() => setRailOpen(false)} />}

      {wizardOpen && <WizardModal onClose={() => setWizardOpen(false)} />}

      <TweaksPanel>
        <TweakSection label="Appearance" />
        <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak("dark", v)} />
        <TweakSection label="Role · demo" />
        <TweakSelect
          label="Sign in as"
          value={userId}
          options={Object.values(USERS).map(u => ({ value: u.id, label: u.name + " · " + ROLES[u.role].label }))}
          onChange={(v) => setUserId(v)}
        />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
