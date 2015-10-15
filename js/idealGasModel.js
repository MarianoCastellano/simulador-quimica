var pressure = $('#pressure'),
    volume = $('#volume'),
    numberOfMoles = $('#numberOfMoles'),
    constant = $('#constant'),
    temperature = $('#temperature'),
    container = d3.select('.model')
        .append('svg')
        .attr('width', '100%')
        .attr('height', $('svg').width())
        .attr('class', 'svg');    

$(document).ready(function (){
    $('.ui.sidebar').sidebar('attach events', '.launch.button');
    $("sup").popup();

    calculatePressure();
    calculationChanged();
});

$('.launch.button').hover(function () {
    $(this).width('100px');
    $(".launch.button > .text").show();
}, function () {
    $(".launch.button > .text").hide();
    $(this).width("10px");
});

var formulaPressure = function (n, v, r, t) {
    return ((n.val() * r.val() * (parseFloat(t.val())).toFixed(2)) / v.val());
};

var formulaTemperature = function (n, v, r, p) {
    return ((p.val() * v.val()) / (n.val() * r.val()));
};

var calculatePressure = function () {
    pressure.val(formulaPressure(numberOfMoles, volume, constant, temperature));
};

var calculateTemperature = function () {
    temperature.val(formulaTemperature(numberOfMoles, volume, constant, pressure));
};

var validarMoles = function(m){
	if (m.val() < 1){
		m.val(1)
	}else{
		if (m.val() > 300){
			m.val(300);	
		};
	}				
};

//a volumen constante
$('#numberOfMoles, #temperature').change(function () {
	validarMoles(numberOfMoles);
    calculatePressure();
    d3.selectAll('.svg > *').remove();
    calculationChanged();
});

var redimensionar = function(v){	
	var coef = v.val()/1000;	
	container
        .attr('height', $('svg').width() * coef);	
};

var validarVolume = function(v){
	if (v.val() < 100){
		v.val(100)
	}else{
		if (v.val() > 2500){
			v.val(2500);	
		};
	}				
};


var validarTemperature = function(t){
	if (parseFloat(t.val()) < 0) {
        t.val(0)
    }else{
		if (parseFloat(t.val()) > 5000) {
    	    t.val(5000);
		}
    }
};

//a temperatura constante
$('#volume').change(function () {
	validarVolume(volume);						  	
    redimensionar(volume);
    calculatePressure();
    calculationChanged();
});

var validarPressure = function(p){
	if (parseFloat(p.val()) < 0) {
        p.val(0)
    }else{
		temp = formulaTemperature(numberOfMoles, volume, constant, pressure);
		//si excedo la temp maxima entonces recalculo la presion a temperatura maxima
		if (temp > 5000){
			temperature.val(5000);
			calculatePressure();
		}
    }
};

//a volumen constante y temeperatura limitada a 5000K
$('#pressure').change(function () {	
	validarPressure(pressure);							
    calculateTemperature();
    calculationChanged();
});

var calculationChanged = function () {
    
	validarTemperature(temperature);
	
	if (parseFloat(temperature.val()) < 0) {
        temperature.val(0);
    }
	
    var nodes = d3.range(Math.round(numberOfMoles.val())).map(function (d, i) {
        var radius = 5,
            x = Math.random() * $('.svg').width() + radius,
            y = Math.random() * $('.svg').height() + radius;
        return {
            radius: radius,
            mass: radius,
            x: x,
            y: y,
            px: x + Math.random() * ((parseFloat(temperature.val())).toFixed(2) / 10),
            py: y + Math.random() * ((parseFloat(temperature.val())).toFixed(2) / 10),
        };
    });

    var circles = container.selectAll('.circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('class', 'circle')
        .attr('r', function (d) {
            return d.radius;
        });

    var redraw = function () {
        circles.attr('cx', function (d) {
            return d.x;
        })
            .attr('cy', function (d) {
                return d.y;
            });
        force.resume();
    };

    var force = d3.layout.force()
        .friction(1)
        .nodes(nodes)
        .charge(0)
        .gravity(0)
        .on('tick.redraw', redraw)
        .start();

    d3.z.collide(force);
    d3.z.deflect(force, 0, 0, $('.svg').width(), $('.svg').height());
};
