//自定义事件

let EventCenter = {
    on:function(type,fn){
        $(document).on(type,fn)
    },
    
    fire:function(type,data){
        $(document).trigger(type,data)
    }
}



let App = {
    init:function(){
        this.bind()
    },

    bind:function(){
        EventCenter.on('channel_change',function(e,data){
            console.log(data)
        })
    }
}

//footer模块
let  Footer = {
    init:function(){
        this.$footer = $('footer')
        this.$ul = $('footer ul')
        this.$box = $('footer .box')
        this.$ul_position_left = this.$ul.css('left')
        
        this.$foot_page_count = null
        
        this.$left_btn = $('footer .icon-left')
        this.$right_btn = $('footer .icon-right')

        this.$page_index = 1

        this.bind()
        this.render()
        console.log("初始化成功...")
    },
    
    bind:function(){
        let _this = this
        $(window).resize(function(){
            _this.setStyle()
        })

        this.$right_btn.on('click',function(){
            if(_this.$page_index<4){
                let box_width = _this.$footer.find('.box').width()
                _this.$ul.animate({left:'-='+ box_width},400)
                _this.$page_index+=1
            }else{
                console.log(`已翻到最后${_this.$page_index}页`)
            }
            
        })

        this.$left_btn.on('click',function(){
            if(_this.$page_index > 1){
                let box_width = _this.$footer.find('.box').width()
                _this.$ul.animate({left:'+='+box_width},400)
                _this.$page_index-=1
            }else{
                console.log(`已翻到第${_this.$page_index}页`)

            }
        })

        this.$ul.on('click','li',function(e){
            let channel_id = e.currentTarget.dataset.channelId
            EventCenter.fire('channel_change',channel_id)

        })
        
    },

    render:function(){
        $.getJSON('//api.jirengu.com/fm/getChannels.php')
         .done( (data)=>{
             console.log("get josn done..")
             console.log(data)
             this.render_footer(data.channels)
         } )
    },

    render_footer:function(channels){
        //把li元素渲染到页面
        let = html_tmp = ''
        channels.forEach((item)=>{

        html_tmp += `
            <li data-channel-id="${item.channel_id}" data-channel-name="${item.name}">  
                <div class="cover" style="background-image:url(${item.cover_small})"></div>  
                <h3>${item.name}</h3>
            </li>
        `
        })
        
        this.$footer.find('ul').html(html_tmp)
        this.setStyle()
        
    },

    setStyle:function(){
        let li_widht = this.$footer.find('li').outerWidth(true)
        let li_count = this.$footer.find('li').length
        console.log(`总共有${li_count}个li`)

        let ul_width = Math.ceil(li_count * li_widht)
        let box_width = this.$box.width()

        let per_page_li = (Math.floor(box_width/li_widht))
        console.log(`每页有${per_page_li}个li`)
        this.$foot_page_count = Math.ceil(li_count/per_page_li)
        console.log(`footer总共有${this.$foot_page_count}页`)
        let real_box_width = Math.floor(per_page_li * li_widht - 2)
        console.log(`真实box宽度${real_box_width}相素.`)

        this.$footer.find('ul').css({width:ul_width})
        this.$box.css({width:real_box_width})
        console.log("sss")
    }
}

Footer.init()
App.init()

