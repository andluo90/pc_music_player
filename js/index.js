//自定义事件

let EventCenter = {
    on:function(type,fn){
        $(document).on(type,fn)
    },
    
    fire:function(type,data){
        $(document).trigger(type,data)
    }
}

EventCenter.on('channel_change',function(e,data){
    console.log(data)
})

//footer模块
let  Footer = {
    init:function(){
        this.$footer = $('footer')
        this.$ul = $('footer ul')
        this.$box = $('footer .box')
        this.$ul_position_left = this.$ul.css('left')
        
        
        this.$left_btn = $('footer .icon-left')
        this.$right_btn = $('footer .icon-right')

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
            let li_width = _this.$footer.find('li').outerWidth(true)
            let box_width = _this.$footer.find('.box').width()
            let current_li_count = Math.floor(box_width/li_width)
            _this.$ul.animate({left:'-='+ current_li_count*li_width},400)
        })

        this.$left_btn.on('click',function(){
            let li_width = _this.$footer.find('li').outerWidth(true)
            let box_width = _this.$footer.find('.box').width()
            let current_li_count = Math.floor(box_width/li_width)
            _this.$ul.animate({left:'+='+current_li_count*li_width},400)
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
        let ul_width = Math.ceil(li_count * li_widht)
        let box_width = this.$box.width()

        let per_page_li = (Math.floor(box_width/li_widht))
        let real_box_width = Math.floor(per_page_li * li_widht - 2)
        console.log(`真实box宽度${real_box_width}相素.`)

        this.$footer.find('ul').css({width:ul_width})
        this.$box.css({width:real_box_width})
        console.log("sss")
    }
}

Footer.init()