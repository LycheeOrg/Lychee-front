let gulp = require("gulp"),
	plugins = require("gulp-load-plugins")(),
	cleanCSS = require("gulp-clean-css"),
	chmod = require("gulp-chmod"),
	del = require("del"),
	sass = require("gulp-sass")(require("sass")),
	paths = {};

/* Error Handler -------------------------------- */

const catchError = function (err) {
	console.log(err.toString());
	this.emit("end");
};

/* Frontend ----------------------------------------- */

paths.frontend = {
	js: ["./scripts/*.js", "./scripts/main/*.js", "./scripts/3rd-party/backend.js"],
	scripts: [
		"node_modules/jquery/dist/jquery.min.js",
		"node_modules/lazysizes/lazysizes.min.js",
		"node_modules/mousetrap/mousetrap.min.js",
		"node_modules/mousetrap/plugins/global-bind/mousetrap-global-bind.min.js",
		"node_modules/@lychee-org/basicmodal/dist/basicModal.min.js",
		"node_modules/multiselect-two-sides/dist/js/multiselect.min.js",
		"node_modules/justified-layout/dist/justified-layout.min.js",
		"node_modules/leaflet/dist/leaflet.js",
		"node_modules/leaflet-rotatedmarker/leaflet.rotatedMarker.js",
		"node_modules/leaflet-gpx/gpx.js",
		"node_modules/leaflet.markercluster/dist/leaflet.markercluster.js",
		"node_modules/livephotoskit/livephotoskit.js",
		"node_modules/qr-creator/dist/qr-creator.min.js",
		"node_modules/sprintf-js/dist/sprintf.min.js",
		"node_modules/stackblur-canvas/dist/stackblur.min.js",
		"node_modules/@lychee-org/leaflet.photo/Leaflet.Photo.js",
		"node_modules/@lychee-org/basiccontext/dist/basicContext.min.js",
		"../dist/_frontend--javascript.js",
	],
	scss: ["./styles/main/*.scss"],
	styles: [
		"node_modules/@lychee-org/basicmodal/src/styles/main.scss",
		"node_modules/@lychee-org/basiccontext/dist/basicContext.min.css",
		"node_modules/@lychee-org/basiccontext/dist/addons/popin.min.css",
		"./styles/main/main.scss",
		"node_modules/leaflet/dist/leaflet.css",
		"node_modules/leaflet.markercluster/dist/MarkerCluster.css",
		"node_modules/@lychee-org/leaflet.photo/Leaflet.Photo.css",
	],
	html: "./html/frontend.html",
	svg: ["./images/iconic.svg", "./images/ionicons.svg"],
};

gulp.task("frontend--js", function () {
	const babel = plugins.babel({
		presets: ["env"],
	});

	return gulp
		.src(paths.frontend.js)
		.pipe(plugins.concat("_frontend--javascript.js", { newLine: "\n" }))
		.pipe(babel)
		.pipe(chmod({execute: false}))
		.on("error", catchError)
		.pipe(gulp.dest("../dist/"));
});

gulp.task(
	"frontend--scripts",
	gulp.series("frontend--js", function () {
		return gulp
			.src(paths.frontend.scripts)
			.pipe(plugins.concat("frontend.js", { newLine: "\n" }))
			.pipe(chmod({execute: false}))
			.on("error", catchError)
			.pipe(gulp.dest("../dist/"));
	})
);

gulp.task("frontend--styles", function () {
	return gulp
		.src(paths.frontend.styles)
		.pipe(sass().on("error", catchError))
		.pipe(plugins.concat("frontend.css", { newLine: "\n" }))
		.pipe(plugins.autoprefixer("last 4 versions", "> 5%"))
		.pipe(cleanCSS({ level: 2 }))
		.pipe(chmod({execute: false}))
		.pipe(gulp.dest("../dist/"));
});

gulp.task("frontend--html", function () {
	return gulp
		.src(paths.frontend.html)
		.pipe(plugins.inject(
			gulp.src(paths.frontend.svg), {
				starttag: "<!-- inject:svg -->",
				transform: function (filePath, _file) {
					return _file.contents.toString("utf8");
				},
			}
		))
		.pipe(chmod({execute: false}))
		.on("error", catchError)
		.pipe(gulp.dest("../dist/"));
});

/* Landing -----------------------------------------  */

paths.landing = {
	js: ["./scripts/landing/*.js"],
	scripts: ["node_modules/jquery/dist/jquery.min.js", "node_modules/lazysizes/lazysizes.min.js", "../dist/_landing--javascript.js"],
	styles: ["./styles/landing/landing.scss"],
};

gulp.task("landing--js", function () {
	const babel = plugins.babel({
		presets: ["env"],
	});

	return gulp
		.src(paths.landing.js)
		.pipe(plugins.concat("_landing--javascript.js", { newLine: "\n" }))
		.pipe(babel)
		.pipe(chmod({execute: false}))
		.on("error", catchError)
		.pipe(gulp.dest("../dist/"));
});

gulp.task(
	"landing--scripts",
	gulp.series("landing--js", function () {
		return (
			gulp
				.src(paths.landing.scripts)
				.pipe(plugins.concat("landing.js", { newLine: "\n" }))
				// .pipe(plugins.uglify())
				.pipe(chmod({execute: false}))
				.on("error", catchError)
				.pipe(gulp.dest("../dist/"))
		);
	})
);

gulp.task("landing--styles", function () {
	return (
		gulp
			.src(paths.landing.styles)
			.pipe(sass().on("error", catchError))
			.pipe(plugins.concat("landing.css", { newLine: "\n" }))
			.pipe(plugins.autoprefixer("last 4 versions", "> 5%"))
			// .pipe(cleanCSS({level: 2}))
			.pipe(chmod({execute: false}))
			.pipe(gulp.dest("../dist/"))
	);
});

/* Images ----------------------------------------- */

paths.images = {
	src: ["./images/password.svg", "./images/no_cover.svg", "./images/no_images.svg", "./node_modules/leaflet/dist/images/*png", "./images/*png"],
};

gulp.task("images--copy", function () {
	return gulp.src(paths.images.src).on("error", catchError).pipe(gulp.dest("../img"));
});

/* leaflet.markercluster.js.map ----------------------------------------- */

paths.leafletMarkerclusterMapFile = {
	src: ["./node_modules/leaflet.markercluster/dist/leaflet.markercluster.js.map"],
};

gulp.task("leafletMarkerclusterMapFile--copy", function () {
	return gulp.src(paths.leafletMarkerclusterMapFile.src).on("error", catchError).pipe(gulp.dest("../dist"));
});

paths.leafletMarkerclusterSourceFiles = {
	src: ["./node_modules/leaflet.markercluster/src/*.js"],
};

gulp.task("leafletMarkerclusterSourceFiles--copy", function () {
	return gulp.src(paths.leafletMarkerclusterSourceFiles.src).on("error", catchError).pipe(gulp.dest("../src"));
});

/* Clean ----------------------------------------- */

gulp.task("clean", function () {
	return del(["../dist/_*.*"], { force: true }).catch((error) => console.log(error));
});

/* Tasks ----------------------------------------- */

gulp.task(
	"default",
	gulp.series(
		gulp.parallel(
			"frontend--scripts",
			"frontend--styles",
			"frontend--html",
			"landing--scripts",
			"landing--styles",
			"images--copy",
			"leafletMarkerclusterMapFile--copy",
			"leafletMarkerclusterSourceFiles--copy"
		),
		"clean"
	)
);

gulp.task(
	"watch",
	gulp.series("default", function () {
		gulp.watch(paths.frontend.js, gulp.series("frontend--scripts"));
		gulp.watch(paths.frontend.scss, gulp.series("frontend--styles"));
		gulp.watch(paths.frontend.html, gulp.series("frontend--html"))
	})
);
