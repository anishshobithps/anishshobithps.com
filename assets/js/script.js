$(document).ready(function () {
    $(window).scroll(function () {
        if (this.scrollY > 20) {
            $(".navbar").addClass("sticky");
        } else {
            $(".navbar").removeClass("sticky");
        }
    });
    $('.menu-btn').click(function(){
        $('.navbar .menu').toggleClass("active");
        $('.menu-btn i').toggleClass("active");
    });

    // typing animation script
    var typed = new Typed(".typing",{
        strings: ["Node.js Developer", "Backend Developer", "Graphics Designer"],
        typeSpeed: 100,
        backSpeed: 60,
        loop: true,
        fadeOut: true,
        
    });
    var typed = new Typed(".typing-2",{
        strings: ["JavaScript","TypeScript","C","C++", "HTML", "Heroku", "Git", "Github"],
        typeSpeed: 100,
        backSpeed: 60,
        loop: true,
    });
});

// Scroll to top button script
const btnScrollToTop = document.querySelector("#btnScrollToTop");
    btnScrollToTop.addEventListener("click", function() {
        window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
    });
});