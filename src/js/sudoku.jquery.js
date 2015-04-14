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

	        //default level
	        for(var i=0; i<5; i++){
	        	var r_elm = random_range(0,81);
	        	_seeds[r_elm] = {};
	        }
	        
	      	//lets fetch the random elements, and initilize them.
	        $(_root).find(".box input[name='edit-input']").each( function( index, elm ){
	        	var data = input2Data({ target : elm });
	        	if( _seeds[data.id] )
	        	{
	        		_seeds[data.id] = data;
	        		var r_val = random_range( 1, 9 );

	        		$(data.input_elm).val( r_val );
					$(data.input_elm).attr("readonly","true");
					$(data.input_elm).off('keyup');

					testSeedInput( data.input_elm );
	        	}
	        });

	    }

	    function testSeedInput(elm)
	    {
	    	var data = input2Data( { target: elm } );
	        //	console.log("data:", data );
	       	var results = check( data );
	        	console.log("testSeedInput:results:", results );
	        	
	        	//console.log( "row.status:", results.row.status , "col.status:", results.col.status, "quad.status:");//, results.quad.status );

	        	//return results;
	    }

	    function inputHandler(e)
	    {
	            e.preventDefault();
	        var data = input2Data(e);
	        var results = check( data );

	        	_history.push( data );
	    }

	    function input2Data(e)
	    {
	        var box_elm    = $(e.target).closest(".box");
	        var id         = box_elm.find("input[name='id']").val();
	        var col_id     = box_elm.find("input[name='col_id']").val();
	        var row_id     = box_elm.find("input[name='row_id']").val();
	        var quad_col   = box_elm.find("input[name='quad-col']").val();
	        var quad_id    = box_elm.find("input[name='quad-id']").val();
	        var input_elm  = box_elm.find("input[name='edit-input']");
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

	    function check( data , config )
	    {
//	            console.log( "check:", data );
	        var results = {};
	            results.row  = testRow( data.row_id );
	            results.col  = testCol( data.col_id );
	            results.quad;// = testQuad( data.quad_id );

//	            console.log( "row:state:", results.row.status , ", col:state:", results.col.status );//,  ", results.quad:", results.quad.status );
	        return results;
	    }

	    function testRow( row_id )
	    {
	        var elms = $(".game-board .box input[name='row_id'][value='"+ row_id +"'] ");
	        return testElms( "row", elms );
	    }

	    function testCol( col_id )
	    {
	        var elms = $(".game-board .box input[name='col_id'][value='"+ col_id +"'] ");
	        return testElms( "column", elms );
	    }

	    function testQuad( quad_id)
	    {
	        var elms = $(".game-board .box input[name='quad-id'][value='"+ quad_id +"'] ");
	        return testElms( "quadrant", elms );
	    }


	    function html2hash(elms)
	    {
	        var hash = {};
	        $.each( elms, function(index, elm){
	            var box = $(elm).closest(".box");
	            var val = $(box).find("input[name='edit-input']").val();
	                val = ( val == "" )? -1 : Number( val );
	                hash[val] = hash[val] ? hash[val] : [];
	                hash[val].push(index);
	                
	        });
//	        console.log("html2hash:hash:", hash );
	        return hash;
	    }

	    function testElms( type, elms )
	    {
	        var hash =  html2hash(elms);
	        var results = { type: type, hash:hash };
	        	
//	        console.log("hash:", hash );
/*
	        if( !hash["-1"] && 
	             hash[1] && hash[2] && hash[3] && hash[4] && 
	             hash[5] && hash[6] && hash[7] && hash[8] && 
	             hash[9] ){
	            //results.status = "success";
	        	//results.error = null;
	            //results.description = "success: winner winner, chicken dinner! "+ type + " has all numbers 1-9."; 
	        }
*/

	        if( hash["-1"] ){
	            //results[type].status = "error";
/*	            
	            results.errors.push( { code:2, 
	            					   description : "error: all " + type + " squares are not filled in" });
*/
	        }

	        
	        if( !hash["-1"] && 
	        	 hash[1] || hash[2] || hash[3] || hash[4] || 
	        	 hash[5] || hash[6] || hash[7] || hash[8] || 
	        	 hash[9] )
	        {
	            //results[type].status = "error";
/*
	            results.errors.push( { code:1, 
	            					   description : "error: " + type + " has duplicate values" } );
*/	        }

	        return results;
	    }

	    /**
	     * util(s)
	     */
	    function gameBoardHTML()
	    {
	//        console.log("gameBoardHTML()");
	        var box_html  = boxHTML();

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
	                     <input type='hidden' name='quad-col' value={{quad_col}}' /> \
	                     <input type='hidden' name='quad-id' value={{quad_id}}' /> \
	                 </form>\
	                 <input type='text' name='edit-input' value='' maxlength='1' onkeypress='return event.charCode >= 49 && event.charCode <= 57' /> \
	            </div>";
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