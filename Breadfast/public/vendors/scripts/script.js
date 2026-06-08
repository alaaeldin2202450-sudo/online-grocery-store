jQuery(window).on("load",function() {
	"use strict";
	// bootstrap wysihtml5
	$('.textarea_editor').wysihtml5({
		html: true
	});
});
jQuery(window).on("load resize", function () {
	// custom scrollbar
	$(".customscroll").mCustomScrollbar({
		theme:"dark-2",
		scrollInertia: 300,
		autoExpandScrollbar: true,
		advanced: { autoExpandHorizontalScroll: true }
	});
});
jQuery(document).ready(function(){
	"use strict";
	// Background Image
	jQuery(".bg_img").each( function ( i, elem ) {
		var img = jQuery( elem );
		jQuery(this).hide();
		jQuery(this).parent().css( {
			background: "url(" + img.attr( "src" ) + ") no-repeat center center",
		});
	});

	/*==============================================================*/
	// Image to svg convert start
	/*==============================================================*/
	jQuery('img.svg').each(function() {
		var $img = jQuery(this);
		var imgID = $img.attr('id');
		var imgClass = $img.attr('class');
		var imgURL = $img.attr('src');
		jQuery.get(imgURL, function(data) {
			var $svg = jQuery(data).find('svg');
			if (typeof imgID !== 'undefined') {
				$svg = $svg.attr('id', imgID);
			}
			if (typeof imgClass !== 'undefined') {
				$svg = $svg.attr('class', imgClass + ' replaced-svg');
			}
			$svg = $svg.removeAttr('xmlns:a');
			if (!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
				$svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'))
			}
			$img.replaceWith($svg);
		}, 'xml');
	});
	/*==============================================================*/
	// Image to svg convert end
	/*==============================================================*/

	// click to scroll
	// $('.collapse-box').on('shown.bs.collapse', function () {
	// 	$(".customscroll").mCustomScrollbar("scrollTo",$(this));
	// });

	// code split
	var entityMap = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': '&quot;',
		"'": '&#39;',
		"/": '&#x2F;'
	};
	function escapeHtml(string) {
		return String(string).replace(/[&<>"'\/]/g, function (s) {
			return entityMap[s];
		});
	}
	//document.addEventListener("DOMContentLoaded", init, false);
	window.onload = function init()
	{
		var codeblock = document.querySelectorAll("pre code");
		if(codeblock.length)
		{
			for(var i=0, len=codeblock.length; i<len; i++)
			{
				var dom = codeblock[i];
				var html = dom.innerHTML;
				html = escapeHtml(html);
				dom.innerHTML = html;
			}
			$('pre code').each(function(i, block) {
				hljs.highlightBlock(block);
			});
		}
	}

	// Search Icon
	$("#filter_input").on("keyup", function() {
		var value = $(this).val().toLowerCase();
		$("#filter_list .fa-hover").filter(function() {
			$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
		});
	});

	// custom select 2 init
	$('.custom-select2').select2();

	// Bootstrap Select
	//$('.selectpicker').selectpicker();

	// tooltip init
	$('[data-toggle="tooltip"]').tooltip()

	// popover init
	$('[data-toggle="popover"]').popover()

	// form-control on focus add class
	$(".form-control").on('focus',function(){
		$(this).parent().addClass("focus");
	})
	$(".form-control").on('focusout',function(){
		$(this).parent().removeClass("focus");
	})

	// sidebar menu icon
	$('.menu-icon, [data-toggle="left-sidebar-close"]').on('click', function(){
		//$(this).toggleClass('open');
		$('.left-side-bar').toggleClass('open');
		$('.mobile-menu-overlay').toggleClass('show');
	});
	$('[data-toggle="header_search"]').on('click', function() {
		jQuery('.header-search').slideToggle();
	});

	var w = $(window).width();
	$(document).on('touchstart click', function(e){
		if($(e.target).parents('.left-side-bar').length == 0 && !$(e.target).is('.menu-icon, .menu-icon img'))
		{
			$('.left-side-bar').removeClass('open');
			$('.menu-icon').removeClass('open');
			$('.mobile-menu-overlay').removeClass('show');
		};
	});
	$(window).on('resize', function() {
		var w = $(window).width();
		if ($(window).width() > 1200) {
			$('.left-side-bar').removeClass('open');
			$('.menu-icon').removeClass('open');
			$('.mobile-menu-overlay').removeClass('show');
		}
	});


	// sidebar menu Active Class
	$('#accordion-menu').each(function(){
		var vars = window.location.href.split("/").pop();
		$(this).find('a[href="'+vars+'"]').addClass('active');
	});


	// click to copy icon
	$(".fa-hover").click(function (event) {
		event.preventDefault();
		var $html = $(this).find('.icon-copy').first();
		var str = $html.prop('outerHTML');
		CopyToClipboard(str, true, "Copied");
	});
	var clipboard = new ClipboardJS('.code-copy');
	clipboard.on('success', function(e) {
		CopyToClipboard('',true, "Copied");
		e.clearSelection();
	});

	// date picker
	$('.date-picker').datepicker({
		language: 'en',
		autoClose: true,
		dateFormat: 'dd MM yyyy',
	});
	$('.datetimepicker').datepicker({
		timepicker: true,
		language: 'en',
		autoClose: true,
		dateFormat: 'dd MM yyyy',
	});
	$('.datetimepicker-range').datepicker({
		language: 'en',
		range: true,
		multipleDates: true,
		multipleDatesSeparator: " - "
	});
	$('.month-picker').datepicker({
		language: 'en',
		minView: 'months',
		view: 'months',
		autoClose: true,
		dateFormat: 'MM yyyy',
	});

	// only time picker
	$( ".time-picker" ).timeDropper({
		mousewheel: true,
		meridians: true,
		init_animation: 'dropdown',
		setCurrentTime: false
	});
	$('.time-picker-default').timeDropper();

	// var color = $('.btn').data('color');
	// console.log(color);
	// $('.btn').style('color'+color);
	$("[data-color]").each(function() {
		$(this).css('color', $(this).attr('data-color'));
	});
	$("[data-bgcolor]").each(function() {
		$(this).css('background-color', $(this).attr('data-bgcolor'));
	});
	$("[data-border]").each(function() {
		$(this).css('border', $(this).attr('data-border'));
	});

	$("#accordion-menu").vmenuModule({
		Speed: 400,
		autostart: false,
		autohide: true
	});

});

// sidebar menu accordion
(function($) {
	$.fn.vmenuModule = function(option) {
		var obj,
		item;
		var options = $.extend({
			Speed: 220,
			autostart: true,
			autohide: 1
		},
		option);
		obj = $(this);

		item = obj.find("ul").parent("li").children("a");
		item.attr("data-option", "off");

		item.unbind('click').on("click", function() {
			var a = $(this);
			if (options.autohide) {
				a.parent().parent().find("a[data-option='on']").parent("li").children("ul").slideUp(options.Speed / 1.2,
					function() {
						$(this).parent("li").children("a").attr("data-option", "off");
						$(this).parent("li").removeClass("show");
					})
			}
			if (a.attr("data-option") == "off") {
				a.parent("li").children("ul").slideDown(options.Speed,
					function() {
						a.attr("data-option", "on");
						a.parent('li').addClass("show");
					});
			}
			if (a.attr("data-option") == "on") {
				a.attr("data-option", "off");
				a.parent("li").children("ul").slideUp(options.Speed)
				a.parent('li').removeClass("show");
			}
		});
		if (options.autostart) {
			obj.find("a").each(function() {

				$(this).parent("li").parent("ul").slideDown(options.Speed,
					function() {
						$(this).parent("li").children("a").attr("data-option", "on");
					})
			})
		}
		else{
			obj.find("a.active").each(function() {

				$(this).parent("li").parent("ul").slideDown(options.Speed,
					function() {
						$(this).parent("li").children("a").attr("data-option", "on");
						$(this).parent('li').addClass("show");
					})
			})
		}

	}
})(window.jQuery || window.Zepto);

// copy to clipboard function
function CopyToClipboard(value, showNotification, notificationText) {
	var $temp = $("<input>");
	if(value != ''){
		var $temp = $("<input>");
		$("body").append($temp);
		$temp.val(value).select();
		document.execCommand("copy");
		$temp.remove();
	}
	if (typeof showNotification === 'undefined') {
		showNotification = true;
	}
	if (typeof notificationText === 'undefined') {
		notificationText = "Copied to clipboard";
	}
	var notificationTag = $("div.copy-notification");
	if (showNotification && notificationTag.length == 0) {
		notificationTag = $("<div/>", { "class": "copy-notification", text: notificationText });
		$("body").append(notificationTag);

		notificationTag.fadeIn("slow", function () {
			setTimeout(function () {
				notificationTag.fadeOut("slow", function () {
					notificationTag.remove();
				});
			}, 1000);
		});
	}
}

// detectIE Browser
(function detectIE() {
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        var ieV = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        document.querySelector('body').className += ' IE';
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        var ieV = parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        document.querySelector('body').className += ' IE';
    }

    // other browser
    return false;
})();


async function loadGroceryProducts() {
    try {
        console.log('Fetching products from MongoDB...');
        const response = await fetch('/api/products');
        const products = await response.json();
        
        console.log(`Loaded ${products.length} products`);
        
        // Check if there's a products container in your HTML
        // You need to tell me what the container ID or class is
        
        // Example: If you have a table with id="productsTable"
        const tableBody = document.querySelector('#productsTable tbody');
        if (tableBody) {
            tableBody.innerHTML = '';
            products.forEach(product => {
                const price = product.pricing?.price || 'N/A';
                const title = product.title || 'No title';
                
                tableBody.innerHTML += `
                    <tr>
                        <td>${title}</td>
                        <td>$${price}</td>
                    </tr>
                `;
            });
        }
        
        // Example: If you have a grid with class="products-grid"
        const grid = document.querySelector('.products-grid');
        if (grid) {
            grid.innerHTML = '';
            products.forEach(product => {
                const price = product.pricing?.price || 'N/A';
                const title = product.title || 'No title';
                
                grid.innerHTML += `
                    <div class="product-card">
                        <h3>${title}</h3>
                        <div class="price">$${price}</div>
                    </div>
                `;
            });
        }
        
        return products;
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
}

// Load products when page is ready
$(document).ready(function() {
    // Your existing code is already here
    
    // Add this line to load products
    loadGroceryProducts();
});
// ============================================
// MONGODB PRODUCTS LOADER
// ============================================

// Function to fetch and display products
async function displayGroceryProducts() {
    try {
        console.log('🛒 Fetching grocery products...');
        
        const response = await fetch('http://localhost:3001/api/products');
        const products = await response.json();
        
        console.log(`✅ Loaded ${products.length} products`);
        
        // Create a products container if it doesn't exist
        let productsContainer = document.getElementById('grocery-products-container');
        
        if (!productsContainer) {
            // Create a new container at the top of the page
            productsContainer = document.createElement('div');
            productsContainer.id = 'grocery-products-container';
            productsContainer.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 400px;
                max-height: 500px;
                background: white;
                border: 2px solid #333;
                border-radius: 10px;
                padding: 15px;
                overflow-y: auto;
                z-index: 9999;
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                font-family: Arial, sans-serif;
            `;
            
            productsContainer.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3 style="margin: 0;">🛒 Grocery Products</h3>
                    <button id="close-products-btn" style="background: red; color: white; border: none; border-radius: 5px; cursor: pointer;">×</button>
                </div>
                <div id="products-list" style="max-height: 400px; overflow-y: auto;">
                    Loading...
                </div>
            `;
            
            document.body.appendChild(productsContainer);
            
            // Close button functionality
            document.getElementById('close-products-btn').onclick = function() {
                productsContainer.style.display = 'none';
            };
        }
        
        // Display products
        const productsList = document.getElementById('products-list');
        if (productsList) {
            if (products.length === 0) {
                productsList.innerHTML = '<p>No products found in database.</p>';
            } else {
                productsList.innerHTML = '';
                products.slice(0, 20).forEach(product => {
                    const price = product.pricing?.price || 'N/A';
                    const title = product.title || 'Untitled';
                    
                    const productDiv = document.createElement('div');
                    productDiv.style.cssText = `
                        border-bottom: 1px solid #ddd;
                        padding: 10px 0;
                        margin-bottom: 5px;
                    `;
                    productDiv.innerHTML = `
                        <strong>${title.substring(0, 50)}</strong><br>
                        <span style="color: green; font-weight: bold;">$${price}</span>
                    `;
                    productsList.appendChild(productDiv);
                });
                
                if (products.length > 20) {
                    productsList.innerHTML += `<p style="text-align: center; color: #666;">Showing 20 of ${products.length} products</p>`;
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Error loading products:', error);
        
        // Show error message
        const productsList = document.getElementById('products-list');
        if (productsList) {
            productsList.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        }
    }
}

// Load products when page is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(displayGroceryProducts, 1000);
    });
} else {
    setTimeout(displayGroceryProducts, 1000);
}