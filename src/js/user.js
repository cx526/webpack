import '../css/user.css'
import $ from 'jquery'
$(function() {
  if(module.hot) {
    module.hot.accept();
    console.log('文件被重新加载了');
    console.log($)
  }
  
})

