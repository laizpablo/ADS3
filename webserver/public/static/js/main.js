(function($){
    $(document).ready(function () {

        var ROOT = window.location.protocol+'//'+window.location.host+'/';

        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
        function activateLoading() {
            $(".loading").removeClass("hide-container")
        }
        function deactivateLoading() {
            $(".loading").addClass("hide-container")
        }
        function showRecipes() {
            $(".recipes-container").removeClass("hide-container")
        }
        function hideRecipes() {
            $(".recipes-container").addClass("hide-container")
        }
        function loadMoreRecipes() {
            $(".load-more .btn").html('<i class=\"fa fa-cog fa-spin fa-fw\" aria-hidden=\"true\"></i> Loading Data').attr("disabled","disabled");
            $.ajax({
                url: ROOT+'api/recipes/',
                data:JSON.stringify({"ingredients":$("#taglist").tagsinput('items'), "skip":$(".recipes").children("div").length}),
                error: function() {
                    alert("AJAX error");
                },
                dataType: 'json',
                success: function(data) {
                    $.each(data['recipes'],function (idx) {
                        var item = data["recipes"][idx];
                        var html = generateOneRecipe(item['_id'], item['name'], item['image'], item['rating']);
                        $(".recipes").append(html);
                    })
                },
                type: 'POST'
            }).done(function () {
                $(".load-more .btn").html('Load More Recipes').removeAttr("disabled");
            });
        }
        function loadRecips() {
            ingredients = $("#taglist").tagsinput('items');
            if(ingredients.length < 1){
                hideRecipes();
                return false;
            }
            activateLoading();
            hideRecipes();
            $(".recipes").html("");
            $.ajax({
                url: ROOT+'api/recipes/',
                data:JSON.stringify({"ingredients":$("#taglist").tagsinput('items')}),
                error: function() {
                    alert("AJAX error");
                },
                dataType: 'json',
                success: function(data) {
                    $.each(data['recipes'],function (idx) {
                        var item = data["recipes"][idx];
                        var html = generateOneRecipe(item['_id'], item['name'], item['image'], item['rating']);
                        $(".recipes").append(html);
                    })
                },
                type: 'POST'
            }).done(function () {
                deactivateLoading();
                showRecipes();
            });
        }
        function generateOneRecipe(id,title,image,rating){
            var scores = '';

            if(!rating){
                scores = 'No Ratings. Be the first <span class="fa fa-check-square"></span>'
            }else{
                numberFull = Math.floor(rating);
                numberHalf = Math.ceil(rating-numberFull);
                numberEmpty = Math.floor(5-rating);

                for(i=0;i<numberFull;i++){
                    scores += '<span class="fa fa-star"></span> '
                }
                for(i=0;i<numberHalf;i++){
                    scores += '<span class="fa fa-star-half-o"></span> '
                }
                for(i=0;i<numberEmpty;i++){
                    scores += '<span class="fa fa-star-o"></span> '
                }
            }

            var html = '<div class="recipe-container col-md-6 col-sm-12"> <a href="recipe/'+id+'"/"> <div class="panel panel-default"> <div class="panel-heading">'+title+'</div> <div class="panel-body" style="background: url('+image+') no-repeat center center; background-size: cover;"><span class="label label-warning label-lg"> '+scores+' </span> </div> </div> </a> </div>';
            return html;
        }

        var ingredients = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: {
                url: ROOT+'api/ingredients/%QUERY/',
                wildcard: '%QUERY'
            }
        });

        $('#typeahead').typeahead({
                hint: true,
                highlight: true,
                minLength: 1
            },
            {
                name: 'states',
                source: ingredients // CHANGE: load the list dynamically
            });

        $("#ingredients-form").submit(function (e) {
            e. preventDefault();
            var value = $("#typeahead", this).val();

            if(value){
                $("#taglist").tagsinput('add', capitalizeFirstLetter(value));
            }

            $("#typeahead", this).typeahead('val','');
        });

        $("#typeahead").focus();
        $("#ingredients").click(function(){
            $("#typeahead").focus();
        });

        $('#taglist').on('itemAdded', function(event) {
            loadRecips()
        });
        $('#taglist').on('itemRemoved', function(event) {
            loadRecips()
        });
        $(".load-more").click(function(){
            loadMoreRecipes()
        })

    })
})(jQuery);