(function( $ ){

	$.fn.sudoku = function($config)
	{
		if( $.data( this, "sudoku" ) ){
			return;			
		} 

		return $(this).each(function() {
				_instances.push( new SudokuGame().init( this, $config ) );
				$.data(this, "sudoku");
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

	    var _self 		= this;
	    
	    var _config 	= {};
	    var _level 		= "easy";
	    var _history 	= [];
	    var _seeds 		= {};
		var _root;

	    function init( elm, config )
	    {
	        console.log("init():", elm );
	        _root = elm;
	        _config = config || {};
	        _level = config.level || _level;

	        initUI();
	        initGame();
	    }

	    function initUI()
	    {
	        var html = gameBoardHTML();

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

	    }

	    function setSeedValue( elm )
	    {
	    	var r_val = random_range( 1, 9 );
    		$(elm).val( r_val );
    		if( !testSeedInput( elm ) ){
//    			console.log("warning:oops:r_val:already exists:", r_val , ", trying again.");
    			return setSeedValue( elm );
    		}
    		return true;
	    }

	    function testSeedInput(elm)
	    {
	    	var data = input2data( { target: elm } );
	       	var results = runTests( data );
//	        	console.log("testSeedInput:col:", results.col.status, "row:", results.row.status, ", quad:", results.quad.status );
	        if( results.col.status == "error" || results.row.status == "error" || results.quad.status == "error" ){
	        	return false;
	        }

	        return true;
	    }

	    function inputHandler(e)
	    {
	            e.preventDefault();

	        var results = runTests( input2data(e) );

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
	            var val = $(box).find("input[name='edit_input']").val();
	                val = ( val == "" )? -1 : Number( val );
	                hash[val] = hash[val] ? hash[val] : [];
	                hash[val].push( index );
	                
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
	    
		/**
		 * public method(s);
		 */
	    return {
	    	init : init,
	    }

	}

})( jQuery );