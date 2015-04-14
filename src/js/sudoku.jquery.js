(function( $ ){

	$.fn.sudoku = function($config)
	{
		if( $.data( this, "sudoku" ) ){
			return;			
		} 

		return $(this).each( function() {
				var instance = new SudokuGame();
					instance.init( this, $config )
					console.log("instance:", instance);
					_instances.push( instance );
					//console.log( $.data( this, "sudoku" , instance ) );
					this.xxx = "asdf";
					return $.data( this, "sudoku" , instance );
		});
	}

	var _instances = [];

	function SudokuGame()
	{
		/**
	     * Rules
	     * 1. Number can appear only once in each row.
	     * 2. Number can appear only once in each column.
	     * 3. Number can appear only once in each region.
	     */

	    var _self 			= this;
	    var MAX_ATTEMPTS 	= 300;

	    var _config 		= {};
	    var DEFAULT_LEVEL	= "easy";
	    var _level 			= DEFAULT_LEVEL;
	    var _root;
		
	    var _history 		= [];
	    var _seeds 			= {};
		var _remainging   	= {};
		var _count 			= 0;
		
		var _isPuzzelSolved = false;

	    function init( elm, config )
	    {
	        console.log("init():", elm );
	        clean();

	        _root = elm;
	        _config = config || {};
	        _level = config.level || _level;

	        initUI();
	        initGame();
	    }

	    function clean()
	    {
	        _remainging = {};
	        _seeds = {};
	        _history = [];
	        _count = 0;
	        _config = {};
	        _level = DEFAULT_LEVEL;
	        _isPuzzelSolved = false;
	        try{
	        	removeErrors();	
	        	$(_root).empty();
	        }catch(e)
	        {}
	        
	    }

	    function initUI()
	    {
	        var html = gameBoardHTML();
	        	html += "<div class'actions'>\
        					<button type='button' class='btn btn-action check'>check</button>\
        					<button type='button' class='btn btn-action solve'>solve</button>\
        					<button type='button' class='btn btn-action startOver'>start over</button>\
    					</div>";

	            $(_root).empty();
	            $(_root).hide();
	            $(_root).html(html);
	            $(_root).find(".box input[type='text']").keyup( inputHandler );
	            $(_root).fadeIn();
	    }
	    
	    function initGame()
	    {
	        
	        console.log("initGame()");
	        _seeds = {};

	        var total_numbs = 0;
	        	total_numbs = (_level == "easy" )? 25 : total_numbs;
	        	total_numbs = (_level == "easy-ish" )? 20 : total_numbs;
	        	total_numbs = (_level == "medium" )? 15 : total_numbs;
	        	total_numbs = (_level == "medium-ish" )? 15 : total_numbs;
	        	total_numbs = (_level == "hard-ish" )? 10 : total_numbs;
	        	total_numbs = (_level == "hard" )? 5 : total_numbs;
	        	console.log("total_numbs:", total_numbs);
	        
	        //default level
	        for(var i=0; i<total_numbs; i++){
	        	var r_elm = random_range(0,81);
	        	_seeds[r_elm] = {};
	        }
	        
	      	//lets fetch the random elements, and initilize them.
	        $(_root).find(".box input[name='edit_input']").each( function( key, elm ){
	        	var data = input2data({ target : elm });
	        	if( _seeds[data.id] )
	        	{
	        		_seeds[data.id] = data;
	        		setSeedValue( elm );
					$(data.input_elm).attr("readonly","true");
					$(data.input_elm).off('keyup');
	        	}
	        });


	        $('.game-board .solve').click(solve);
	        $('.game-board .check').click(check);

	    }

	    function setSeedValue( elm )
	    {
	    	var r_val = random_range( 1, 9 );
    		$(elm).val( r_val );
    		if( !testInput( elm ) ){
    			return setSeedValue( elm );
    		}
    		return true;
	    }

	    function testInput(elm)
	    {
	    	var data = input2data( { target: elm } );
	       	var results = runTests( data );
	        if( results.col.status == "error" || results.row.status == "error" || results.quad.status == "error" ){
	        	return false;
	        }
	        return true;
	    }
		
		function check()
	    {
	    	console.log("check()");
	    	$.each(_history, function(index, move){
	    		var elm;
	    		if(move.row.status == "error"){
	    			highlightErrors(move, "row");
	    		}
	    		
	    		if( move.col.status == "error"){	    			
					highlightErrors(move, "col");
	    		}
				
				if(move.quad.status == "error")
	    		{
	    			highlightErrors(move, "quad");	
	    		}

	    		setTimeout( function(){
	    			removeErrors();
	    		}, 3000 );

	    	});
	    }

	    function highlightErrors( move , type )
	    {
	    	var id = null;
	    		id = (type == "quad")? move.data.quad_id : id;
	    		id = (type == "row")? move.data.row_id : id;
	    		id = (type == "col")? move.data.col_id : id;
	    		
	    		elm = $(".game-board .box input[name='"+type+"_id'][value='"+ id +"'] ").closest(".box");
				$(elm).addClass("error-quad");
			
				elm = $(".game-board .box input[name='id'][value='"+ move.data.id +"'] ").closest(".box");
				elm.addClass("error");	
				elm.css("background-color", "#ff0000");	

			var _duplicates = move[type].hash[move.data.val];

			$.each( _duplicates, function(index, item){
				elm = $(".game-board .box input[name='id'][value='"+ item.data.id +"'] ").closest(".box");	    			
				elm.addClass("error-duplicate");	
				elm.css("background-color", "#ff0000");
				elm.find("input[name='edit_input']").css("color", "#fff");	
			});

				
	    }

	    function removeErrors()
	    {	
	    	$(_root).find(".box").removeClass("error");
			$(_root).find(".box").removeClass("error-col");
			$(_root).find(".box").removeClass("error-row");
			$(_root).find(".box").removeClass("error-quad");
			$(_root).find(".box").css("background-color", "");	
			$(_root).find(".box input[name='edit_input']").css("color", "");
	    }

		
	    
	    function solve()
	    {
			console.log("solve()");
			_count = 0;
			_remainging = {};
			$( _root ).find(".box input[name='edit_input']").each( function( key, elm ){
				var data = input2data({ target : elm });
					if( data.val == Number( -1 ) )
					{
						_remainging[data.id] = data;
						_isPuzzelSolved = setRemainingValue( elm );
						console.log("");
						if( _isPuzzelSolved ){
							console.log( "Puzzel Solved" );
						}else{
							console.log( "Well damn, we can't solve this puzzel..." );
						}
					}
			});
	    }

	    function setRemainingValue( elm )
	    {
			console.log("setRemainingValue()");
	    	_count++;
	    	if( _count > MAX_ATTEMPTS )
	    	{
	    		return { error: "can't solve the puzzel, exceeded MAX_ATTEMPTS:", MAX_ATTEMPTS }
	    	}
	    	var r_val = random_range( 1 , 9 );
    		$(elm).val( r_val );
    		
    		if( !testInput( elm ) ){
    			return setRemainingValue( elm );
    		}
    		return true;
	    }
	    
	    function startOver()
	    {
	    	console.log("startOver()");
	    }

	    function inputHandler(e)
	    {
	            e.preventDefault();
			
				removeErrors();

	        var results = runTests( input2data( e ) );

			if( results.col.status == "error" ){
				console.log("err... huston... col has a duplicate...");
			}
			if( results.row.status == "error" ){
				console.log("err... huston... row has a duplicate...");
			}
			if( results.quad.status == "error" ){
	        	console.log("err... huston... quad has a duplicate...");
	        }
	        if( results.col.status == "ok" && results.row.status == "ok" && results.quad.status == "ok" ){
	        	console.log("ok, were all cool, yo... ");
	        }

	        _history.push( results );
	    }

	    function input2data(e)
	    {
	        var box_elm    = $(e.target).closest(".box");
	        var id         = box_elm.find("input[name='id']").val();
	        var col_id     = box_elm.find("input[name='col_id']").val();
	        var row_id     = box_elm.find("input[name='row_id']").val();
	        var quad_col   = box_elm.find("input[name='quad_col']").val();
	        var quad_id    = box_elm.find("input[name='quad_id']").val();
	        var input_elm  = box_elm.find("input[name='edit_input']");
	        var val        = input_elm.val();

	            val = ( val == "" )? -1 : Number( val );
	        
	        return {
	                box_elm : box_elm,
	                input_elm: input_elm,
	                id : id,
	                col_id : col_id,
	                row_id : row_id,
	                quad_col : quad_col,
	                quad_id : quad_id, 
	                val : val
	            }
	    }

	    function runTests( data , config )
	    {
	        var results = {};
	        	results.data = data;
	            results.row  = testRow( data.row_id );
	            results.col  = testCol( data.col_id );
	            results.quad = testQuad( data.quad_id );

	        return results;
	    }
		
		function test( type, elms )
	    {
	        var hash =  html2hash(elms);
	        var results = { type: type, hash:hash };
	        	
	        	results.status = "ok";
	        	results.description = "no worries";
	        
	        if( Object.keys(hash).sort().join("") == "123456789" )
	        {
	        	results.status = "ok";
	        	results.description = "success: winner winner, chicken dinner! "+ type + " is compelte 1-9.";
	        }else{
	        	//lets find duplicates & throw an error or something...
		        $.each( hash, function( key, val ){
		        	if( val.length > 1 && key != -1 ){
		        		results.status = "error";
		        		results.description = String("err... huston... we have a problem, "+ type + "has  duplicate: key:"+ key+ ", at the index:"+ val );
		        	}
		        });
	        }

	        return results;
	    }

	    /**
	     * helper(s)
	     */
	    function testRow( row_id )
	    {
	        return test( "row", $(".game-board .box input[name='row_id'][value='"+ row_id +"'] ") );
	    }

	    function testCol( col_id )
	    {
	        return test( "column", $(".game-board .box input[name='col_id'][value='"+ col_id +"'] ") );
	    }

	    function testQuad( quad_id)
	    {
	        return test( "quadrant", $(".game-board .box input[name='quad_id'][value='"+ quad_id +"'] ") );
	    }

	    
		
		/**
		 * data-binding
		 */
		function html2hash(elms)
	    {
	        var hash = {};
	        $.each( elms, function(index, elm){
	            var box = $(elm).closest(".box");
	            var input_elm = $(box).find("input[name='edit_input']");
	            var val = $(input_elm).val();
	                val = ( val == "" )? -1 : Number( val );
	                hash[val] = hash[val] ? hash[val] : [];
				
				var data = input2data( { target: input_elm } );
	                hash[val].push( { index:index, 
									  data : data } );
	                
	        });
	        return hash;
	    }

	    /**
	     * util(s)
	     */
	    function gameBoardHTML()
	    {
	//        console.log("gameBoardHTML()");
	        var box_html  = boxHTML();
	        var hud_html = hudHTML();

	        //var html = hud_html;
	        var html = "";
	        var row = 0;
	        var col = 0;
	        var quad_col = 0;
	        var base_quad = 0;
	        var quad_id = 0;
	        var quad = 0;
	        var offset = 0;

	        for(var i=0; i<81; i++ )
	        {
	            var tmpl = box_html;

	            if( col >= 9 ){
	                col = 0;
	                row++;
	            }

	                quad_col = col % 3;
	                quad = Math.floor( col / 3 );
	                offset = i%27;

	                quad_id = base_quad + quad;
	            
	            if( quad_id == 0 || 
	                quad_id == 2 || 
	                quad_id == 4 || 
	                quad_id == 6 || 
	                quad_id == 8 )
	            {
	                tmpl = tmpl.split("{{is_odd}}").join("odd");
	            }else{
	                tmpl = tmpl.split("{{is_odd}}").join("");
	            }
	            
	            tmpl = tmpl.split("{{id}}").join(i);
	            tmpl = tmpl.split("{{row_id}}").join(row);
	            tmpl = tmpl.split("{{col_id}}").join(col);
	            tmpl = tmpl.split("{{quad_col}}").join(quad_col);
	            tmpl = tmpl.split("{{quad_id}}").join(quad_id);

	            if( quad == 2 && col == 8 && offset == 26 )
	            {
	                //3 quadrants per row
	                base_quad+=3;
	            }

	            col++;
	            html += tmpl;
	        }
	        return html;
	    }


	    function boxHTML()
	    {
	        return "\
	            <div class='box {{is_odd}}'>\
	                 <form>\
	                     <input type='hidden' name='id' value='{{id}}' /> \
	                     <input type='hidden' name='col_id' value='{{col_id}}' /> \
	                     <input type='hidden' name='row_id' value='{{row_id}}' /> \
	                     <input type='hidden' name='quad_col' value='{{quad_col}}' /> \
	                     <input type='hidden' name='quad_id' value='{{quad_id}}' /> \
	                 </form>\
	                 <input type='text' name='edit_input' value='' maxlength='1' onkeypress='return event.charCode >= 49 && event.charCode <= 57' /> \
	            </div>";
	    }

	    function hudHTML()
	    {
	    	return "\
				<div class='start_screen'>\
					stuff goes here...\
				</div>\
				<div class='finished_screen hidden'></div>\
	    	";
	    }


	    function random_range( min, max )
	    {
	    	return Math.floor(Math.random() * (max - min)) + min;
	    }
	    

	    
	    function level()
	    {
	    	return _level;
	    }
	    function history()
	    {
	    	return _history;
	    }
	    function seeds()
	    {
	    	return _seeds;
	    }

		/**
		 * public method(s);
		 */
	    return {
	    	init : init,
	    	check : check,
	    	solve : solve,
	    	startOver : startOver,
	    	history : history, 
	    	seeds: seeds, 
	    	level:level
	    }

	}

})( jQuery );