rm(list=ls(all=TRUE))


gen_order <- function(){


    gen_cupnum <- function(){
        rand_float <- runif(1, min = 0, max = 1)
        checker <- c(rand_float < 0.6, rand_float < 0.9, rand_float < 0.975, rand_float < 0.99, rand_float <= 1)

        return(which.max(as.numeric(checker)))
    }

    gen_menu <- function(){
        menu <- c("cafeore.brend",
                  "2024win.brend",
                  "au_latte.ice" ,
                  "au_latte.hot" ,
                  "coffee.ice"   ,
                  "special.hot"  ,
                  "milk.ice"     ,
                  "pink.single"  ,
                  "red.single"   ,
                  "blue.single"  ) 
        rand_float <- runif(1, min = 0, max = 1)
        checker <- c(rand_float < 0.22, #cafeore.brend
                     rand_float < 0.44, #2024win.brend
                     rand_float < 0.57, #au_latte.ice
                     rand_float < 0.67, #au_latte.hot
                     rand_float < 0.77, #coffee.ice
                     rand_float < 0.84, #special.hot
                     rand_float < 0.85, #milk.ice
                     rand_float < 0.90, #pink.single
                     rand_float < 0.95, #red.single
                     rand_float <= 1)   #blue.single
        return(menu[which.max(as.numeric(checker))])
    }

    order_cupnum <- gen_cupnum()
    order_ingredients <- rep("", order_cupnum)
    for(i in 1:order_cupnum){
        order_ingredients[i] <- gen_menu()
    }
    return(sort(order_ingredients))
}




#   for(s in 1:100){
#       cat(s, gen_order(), "\n", file = "order_sample.txt", append = TRUE)
#   }

gen_order()

