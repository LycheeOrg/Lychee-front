const landing = {};

/**
 * @returns {void}
 */
landing.runInitAnimations = function () {
	$("#loader_wrap").fadeOut(1000);

	$(".animate-down").each(function (index) {
		setTimeout((elem) => elem.addClass("toggled"), 100 * index, $(this));
	});

	$(".animate-up").each(function (index) {
		setTimeout((elem) => elem.addClass("toggled"), 100 * index, $(this));
	});

	$(".pop-in").each(function (index) {
		setTimeout((elem) => elem.addClass("toggled"), 100 * index, $(this));
	});

	$(".pop-out").each(function (index) {
		setTimeout((elem) => elem.addClass("toggled"), 100 * index, $(this));
	});
};

/**
 * @returns {void}
 */
landing.runInitAnimationsHome = function () {
	$(".pop-in").each(function (index) {
		setTimeout((elem) => elem.addClass("toggled"), 100 * index, $(this));
	});

	const onFadedOut = function () {
		$(".pop-in-last").each(function (index) {
			setTimeout((elem) => elem.addClass("toggled"), 100 * index, $(this));
		});

		$(".animate-down").each(function (index) {
			setTimeout((elem) => elem.addClass("toggled"), 100 * index, $(this));
		});

		$(".animate-up").each(function (index) {
			setTimeout((elem) => elem.addClass("toggled"), 100 * index, $(this));
		});
	};

	setTimeout(() => $("#intro").fadeOut(1000, onFadedOut), 2500);
};

$(document).ready(function () {
	// Prevent users from saving images

	/*
				$("body").on("contextmenu",function(){
					return false;
				});
		*/

	// Toggle menu and menu setup

	$("#intro_content").css({
		paddingTop: ($(window).height() - 50) / 2 + "px",
	});

	$(".sub-menu").hide();

	// $('#menu a').each(function() {

	// 	var $this = $(this);
	// 	var href = $(this).attr("href");
	// 	var text = $(this).html();

	// 	// if ( $this.html() == "Store" || $this.closest("ul").hasClass("sub-menu") ) {
	// 	//
	// 	// } else {
	// 	// 	$("#mobile_menu_wrap").prepend('<a class="animate" href="' + href + '">' + text + '</a>');
	// 	// }

	// });

	// $('.sub-menu a').each(function() {
	//
	// 	var $this = $(this);
	// 	var href = $(this).attr("href");
	// 	var text = $(this).html();
	//
	// 	$("#mobile_menu_wrap").append('<a class="animate" href="' + href + '">' + text + '</a>');
	//
	// });

	$("#menu li").hover(
		function () {
			if ($(this).find(".sub-menu").length > 0) {
				$(this).find(".sub-menu").show();
			}
		},
		function () {
			if ($(this).find(".sub-menu").length > 0) {
				$(this).find(".sub-menu").hide();
			}
		}
	);

	// $('.hamburger').on("click", function() {
	//
	// 	$(this).toggleClass("is-active");
	//
	// 	if ( $(this).hasClass("is-active") == true ) {
	// 		$("#mobile_menu_wrap").fadeIn(800);
	//
	// 		$("#mobile_menu_wrap a").each(function(index) {
	// 			var $this = $(this);
	// 			setTimeout(function() {
	// 				$this.addClass("popped");
	// 			}, 100 * index);
	// 		});
	//
	// 	} else {
	// 		$("#mobile_menu_wrap").fadeOut(800);
	// 		$("#mobile_menu_wrap a").removeClass("popped");
	// 	}
	//
	// 	return false;
	// });

	// var homeslider = $('#slides');
	//
	// if( homeslider ) {
	//
	// 	var homeslider_slides = homeslider.find("li").length;
	// 	var playSpeed = 0;
	//
	// 	if ( homeslider_slides > 1 ) {
	// 		playSpeed = 5000;
	// 	}
	//
	// 	homeslider.superslides({
	// 		play : playSpeed,
	// 		pagination : true,
	// 		animation : "fade",
	// 		animation_speed : 1500
	// 	});
	// }

	// Gallery page

	// $('#gallery_nav a').on("click", function() {
	//
	// 	var targets = $(this).data("category");
	//
	// 	$(this).addClass("active").parent().siblings("li").find('a').removeClass("active");
	//
	// 	if ( targets == "all" ) {
	//
	// 		$('.grid-item').show();
	//
	// 	} else {
	//
	// 		$('.grid-item').each(function() {
	//
	// 			var $this = $(this);
	// 			var thisCat = $(this).data("category");
	//
	// 			if ( thisCat.indexOf(targets) >= 0 ) {
	// 				$this.show();
	// 			} else {
	// 				$this.hide();
	// 			}
	//
	// 		});
	//
	// 	}
	//
	// 	galleryGrid.masonry();
	//
	// 	console.log(targets);
	//
	// 	return false;
	// });

	if ($("#intro").length > 0) {
		landing.runInitAnimationsHome();
	} else {
		landing.runInitAnimations();
	}
});

// $(window).load(function() {
//
// 	if ( $('#intro').length > 0 ) {
// 		landing.runInitAnimationsHome();
// 	} else {
// 		landing.runInitAnimations();
// 	}
//
// 		// if ( $('.gallery_grid').length > 0 ) {
// 		//
// 		// 	galleryGrid = $('.gallery_grid').masonry({
// 		// 		columnWidth: '.grid-sizer',
// 		// 		itemSelector: '.grid-item',
// 		// 		percentPosition: true
// 		// 	});
// 		//
// 		// }
//
// 		// $('#single_product_image').zoom({
// 		// 	url: $('#single_product_image').find('img').attr('src'),
// 		// 	magnify : 0.7
// 		// });
//
// 		// Run animations
//
// });
