(function( $ ){

	//NOTE: inorder to get around have many instances, and several types of classes, I'm wraping each class in their own constructor, and creating instances for each child selected
	$.fn.sudoku = function($config)
	{
		if( $.data( this, "sudoku" ) ){
			return;			
		} 

		return $(this).each(function() {
//				console.log( "sudoku:", $config.sudoku );
		        _instances.push( new SudokuGame().init( this, $config ) );
//		        console.log("_instances:", _instances.length);
		        $.data(this, "sudoku");
		});
	}

	var _instances = [];

	function SudokuGame()
	{
		/**
	     * Rules
	     * 1. Number can appear only once on each row.
	     * 2. Number can appear only once on each column.
	     * 3. Number can appear only once on each region.
	     */
	//     var _self = this;
	     var _root;
	     var _config = {};

	    this.init = init;

	    function init( elm, config )
	    {
	        console.log("init():", elm );
	        _root = elm;
	        _config = config;

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
	    
	    function inputHandler(e)
	    {
	            e.preventDefault();
	        var data = getEventData(e);
	//            console.log("inputHandler():id:", data.id );
	            check( data );
	    }

	    function getEventData(e)
	    {
	        var elm      = $(e.target).closest(".box");
	        var id       = elm.find("input[name='id']").val();
	        var col_id     = elm.find("input[name='col_id']").val();
	        var row_id     = elm.find("input[name='row_id']").val();
	        var quad_col = elm.find("input[name='quad-col']").val();
	        var quad_id  = elm.find("input[name='quad-id']").val();
	        var val     = elm.find("input[name='edit-input']").val();
	            val = ( val == "" )? -1 : Number( val );
	        
	        return {
	                elm : elm,
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
	            console.log( "move:", data );
	        var results = {};
	            results.row  = testRow( data.row_id );
	            results.col  = testCol( data.col_id );
	            results.quad;// = testQuad( data.quad_id );

	            console.log( "row:state:", results.row.status , ", col:state:", results.col.status );//,  ", results.quad:", results.quad.status );
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


	    function boxes2hash(elms)
	    {
	        var hash = {};
	        $.each( elms, function(index, elm){
	            var box = $(elm).closest(".box");
	            var val = $(box).find("input[name='edit-input']").val();
	                val = ( val == "" )? -1 : Number( val );
	                hash[val] = hash[val] ? hash[val] : [];
	                hash[val].push(index);
	                
	        });
	        return hash;
	    }

	    function testElms( type, elms )
	    {
	        var hash =  boxes2hash(elms);
	        var results = {};

	        if( hash["-1"] ){
	            results.status = "error";
	            results.description = "error: all " + type + " squares are not filled in";
	        }
	        
	        if( !hash["-1"] && hash[1] && hash[2] && hash[3] && hash[4] && hash[5] && hash[6] && hash[7] && hash[8] && hash[9] )
	        {
	            results.status = "error";
	            results.description = "error: " + type + " has duplicate values";
	        }

	        if( !hash["-1"] && 
	             hash[1] && 
	             hash[2] && 
	             hash[3] && 
	             hash[4] && 
	             hash[5] && 
	             hash[6] && 
	             hash[7] && 
	             hash[8] && 
	             hash[9] ){
	            results.status = "success";
	            results.description = "success: winner winner, chicken dinner! "+ type + " has all numbers 1-9."; 
	        }

	        return results;
	    }

	    function solve()
	    {
	        //
	    }

	    function initGame()
	    {
	        //Math.random() * 81;
	    }

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

	        for( var i=0; i<81; i++ )
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
	}

})( jQuery );