// Request Animation Frame
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

var WIDTH = 960, HEIGHT = 640;

var canvas = jQuery("#gameCanvas")[0];
var context = canvas.getContext("2d");
canvas.width = WIDTH;
canvas.height = HEIGHT;

//
var level;
// player default speeds
var xspeed = 0;
var yspeed = 0;
var max_yspeed = 20;
var walk_speed = 5;
var climb_speed = 3;
// am I climbing?
var climbing = false;
// am I jumping?
var jumping = false;
// can I jump?
var can_jump = true;
// gravity & jump settings
var gravity = 1;
var walking_while_jumping = true;
var jump_walk = true;

var tile_size = 50;
var jump_power = tile_size * 0.45;

var array_muros;
var array_escaleras;
var key_state;
var player;

var saltos;
var MAX_SALTOS = 6;
var space_pressed;

//

function estaEnLaEscalera()
{
	return checkCollide(player.x, player.y + player.height / 2 - 1, array_escaleras);
}

function hayEscalerasPorDebajo()
{
	return checkCollide(player.x, player.y + player.height / 2, array_escaleras);
}

function hayMurosPorDebajo()
{
	return checkCollide(player.x, player.y + player.height / 2, array_muros);
}

function getViewPort()
{

	var x = Math.max(player.x, WIDTH / 2);
	var y = Math.max(player.y, HEIGHT / 2);

	x = Math.min(x, level[0].length * tile_size - WIDTH / 2);
	y = Math.min(y, level.length * tile_size - HEIGHT / 2);

	var actualPosition = {x: x, y: y};
	var centerOfView = {x: WIDTH / 2, y: HEIGHT / 2};

	var viewPoint = {x: centerOfView.x  - actualPosition.x, y: centerOfView.y - actualPosition.y };

	return viewPoint;
}

var checkCollide = function (x, y, array)
{
	for(var i = 0; i < array.length; i++)
	{
		var left = array[i].x;
		var top = array[i].y;
		var right = left + tile_size;
		var bottom = top + tile_size;

		if(x >= left && y >= top && x <= right && y <= bottom)
			return true;
	}
	return false;
};

var PlayerSprite = function(x,y)
{
	this.x = x;
	this.y = y;
	this.width = tile_size / 2;
	this.height = tile_size;
	this.direction = 1;

	this.draw = function()
	{
		context.save();

		context.translate(this.x, this.y);
		context.translate(this.width * 0.5, this.height * 0.5);
		context.rotate( ( Math.PI / 180 ) * (this.direction * 3) );

		context.fillStyle = "#FF0000";
		context.fillRect(-this.width, -this.height, this.width, this.height);
		context.strokeStyle = "#000000";
		context.strokeRect(-this.width, -this.height, this.width, this.height);

		// context.drawImage( image, -width * 0.5, -height * 0.5 );

		context.restore();
	};	

};

//

function thread()
{
	draw();
	update();
	requestAnimFrame(thread);
}

function init()
{

	space_pressed = false;
	saltos = 0;
	player = new PlayerSprite(tile_size * 3,  tile_size * 3);

	key_state = { UP: false, DOWN: false, LEFT: false, RIGHT: false, SPACE: false };

	array_muros = [];
	array_escaleras = [];
	key_states = [];

	level = new Array();

	level[0] = new Array(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);
	level[1] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1);
	level[2] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1);
	level[3] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1);
	level[4] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1);
	level[5] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 1);
	level[6] = new Array(1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1);
	level[7] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1);
	level[8] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1);
	level[9] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1);
	level[10] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1);
	level[11] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1);
	level[12] = new Array(1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1);
	level[13] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1);
	level[14] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1);
	level[15] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1);
	level[16] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1);
	level[17] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 1);
	level[18] = new Array(1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1);
	level[19] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1);
	level[20] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1);
	level[21] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1);
	level[22] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1);
	level[23] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1);
	level[24] = new Array(1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1);
	level[25] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1);
	level[26] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1);
	level[27] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1);
	level[28] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1);
	level[29] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 1);
	level[30] = new Array(1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1);
	level[31] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1);
	level[32] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1);
	level[33] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1);
	level[34] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1);
	level[35] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1);
	level[36] = new Array(1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1);
	level[37] = new Array(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1);		
	level[38] = new Array(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1);

	//
	for(row = 0; row < level.length; row++)
	{
		for(col = 0; col < level[0].length; col++)
		{
			var x = col * tile_size;
			var y = row * tile_size;
			if(level[row][col] == 1)
			{
				array_muros.push({x: x, y: y});
			}else if(level[row][col] == 2)
			{
				array_escaleras.push({x: x, y: y});
			}
		}
	}
	//


}

function draw()
{
	var col, row;

	context.clearRect(0, 0, WIDTH, HEIGHT);

	context.fillStyle = "#CCCCCC";
	context.fillRect(0, 0, WIDTH, HEIGHT);

	context.save();
	context.translate(getViewPort().x, getViewPort().y);

	//

	for(row = 0; row < level.length; row++)
	{
		for(col = 0; col < level[0].length; col++)
		{
			var x = col * tile_size;
			var y = row * tile_size;
			if(level[row][col] == 1)
			{
				context.fillStyle = "#00FF00";
				context.fillRect(x, y, tile_size, tile_size);
			}else if(level[row][col] == 2)
			{
				context.fillStyle = "#FE2EF7";
				context.fillRect(x, y, tile_size, tile_size);
			}
		}
	}

	//

	player.draw();

	context.restore();


}

function update()
{

	// Controles

	// Evalua si no esta en la escalera
	if(!estaEnLaEscalera())
	{
		climbing = false;
	}

	player.direction = 0;

	if(key_state.UP)
	{
		if(estaEnLaEscalera())
		{
			yspeed = -climb_speed;
			climbing = true;
			jumping = false;
		}
	}

	if(key_state.DOWN)
	{
		if(estaEnLaEscalera() || hayEscalerasPorDebajo())
		{
			yspeed = climb_speed;
			climbing = true;
			jumping = false;
		}	
	}

	if(key_state.LEFT)
	{
		/*
		if (jump_walk || can_jump) {
			xspeed = -walk_speed;
		}
		*/
        if (climbing) {
            xspeed = -climb_speed;
        }
        else {
            if (walking_while_jumping || can_jump) {
                xspeed = -walk_speed;
                player.direction = -1;
            }
        }

	}

	if(key_state.RIGHT)
	{
		/*
		if (jump_walk || can_jump) {
			xspeed = walk_speed;
		}
		*/
        if (climbing) {
            xspeed = climb_speed;
        }
        else {
            if (walking_while_jumping || can_jump) {
                xspeed = walk_speed;
                player.direction = 1;
            }
        }		
	}

	if(!space_pressed && key_state.SPACE && saltos < MAX_SALTOS && can_jump /*&& !jumping*/ && !climbing)
	{
		saltos++;
		yspeed -= jump_power;
		jump_power *= 0.5;
		// can_jump = false;
		jumping = true;
		space_pressed = true;
	}

	//

	if (!climbing) {
        yspeed += gravity;
    }

    if (yspeed > max_yspeed) {
        yspeed = max_yspeed;
    }

	//

	if (hayMurosPorDebajo() && !jumping && !climbing) {
		yspeed = 0;
	}
	if (hayEscalerasPorDebajo() && !jumping && !climbing) {
		yspeed = 0;
	}

	//    

    forecast_x = player.x + xspeed;
    forecast_y = player.y + yspeed;

	// floor control 
	while(checkCollide(forecast_x, forecast_y + player.height / 2 -1 + yspeed, array_muros))
	{
		/*
		yspeed--;
        can_jump = true;
        */
		forecast_y--;
        xspeed = 0;
        yspeed = 0;
        jumping = false;
        saltos = 0;
        jump_power = tile_size * 0.45;
	}

	// left control
	while(checkCollide(forecast_x - player.width / 2 + xspeed, forecast_y, array_muros))
	{
		forecast_x++;
        xspeed = 0;
	}

	// right control
	while(checkCollide(forecast_x + player.width / 2 + xspeed, forecast_y, array_muros))
	{
		forecast_x--;
        xspeed = 0;
	}

	// ceiling control
	while(checkCollide(forecast_x, forecast_y - player.height / 2 + 1 + yspeed, array_muros))
	{
		forecast_y++;
        yspeed = 0;
	}	

	/*
 	player.y += yspeed;
    player.x += xspeed;
    if (jump_walk || can_jump) {
        xspeed = 0;
    }
    */

    if(yspeed > 0 && !jumping)
    	jumping = true;

    player.x = forecast_x;
    player.y = forecast_y;

	// adjusting speeds for next frame
    xspeed = 0;
    if (climbing) {
        yspeed = 0;
    }    
}

//

jQuery(document).keydown(function(e)
{
	var key = e.which;

	if(key == 38) // Arriba
	{
		key_state.UP = true;
	}
	else if(key == 37) // Izquierda
	{
		key_state.LEFT = true;
	}
	else if(key == 39) // Derecha
	{
		key_state.RIGHT = true;
	}
	else if(key == 40) // Abajo
	{
		key_state.DOWN = true;
	}
	else if(key == 32) // Espacio
	{
		key_state.SPACE = true;
	}
});

jQuery(document).keyup(function(e)
{
	var key = e.which;

	if(key == 38) // Arriba
	{
		key_state.UP = false;
	}
	else if(key == 37) // Izquierda
	{
		key_state.LEFT = false;
		xspeed= 0;
	}
	else if(key == 39) // Derecha
	{
		key_state.RIGHT = false;
		xspeed= 0;
	}
	else if(key == 40) // Abajo
	{
		key_state.DOWN = false;
	}
	else if(key == 32) // Espacio
	{
		key_state.SPACE = false;
		space_pressed = false;
	}
});


//


init();
requestAnimFrame(thread);