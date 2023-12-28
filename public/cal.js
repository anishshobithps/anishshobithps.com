(function (window, scriptSrc, namespace) {
    const document = window.document;
    const Cal =
        window.Cal ||
        function () {
            const cal = Cal;
            const args = arguments;

            if (!cal.loaded) {
                cal.ns = {};
                cal.q = cal.q || [];
                document.head.appendChild(
                    document.createElement("script"),
                ).src = scriptSrc;
                cal.loaded = true;
            }

            if (args[0] === namespace) {
                const api = function () {
                    api.q.push(arguments);
                };

                const nsArg = args[1];
                api.q = api.q || [];

                if (typeof nsArg === "string") {
                    cal.ns[nsArg] = api;
                    api(args);
                } else {
                    cal.q.push(args);
                }

                return;
            }

            cal.q.push(args);
        };

    window.Cal = Cal;
})(window, "https://app.cal.com/embed/embed.js", "init");

Cal("init", "meet", { origin: "https://cal.com" });

// Important: Please add the following attributes to the element that should trigger the calendar to open upon clicking.
// `data-cal-link="anishshobithps/meet"`
// data-cal-namespace="meet"
// `data-cal-config='{"layout":"month_view"}'`

Cal.ns.meet("ui", {
    styles: { branding: { brandColor: "#000000" } },
    hideEventTypeDetails: false,
    layout: "month_view",
});