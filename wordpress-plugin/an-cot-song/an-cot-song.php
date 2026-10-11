<?php
/**
 * Plugin Name: An Cột Sống — 3D & PWA
 * Description: Nhúng webapp quản lý nội dung từ Google Sheet; cầu nối tới máy chủ Web Push riêng.
 * Version: 1.0.0
 * Requires PHP: 7.4
 */
if (!defined('ABSPATH')) exit;
add_shortcode('an_cot_song', function () {
    $url = plugins_url('app/An-Cot-Song.html', __FILE__);
    return '<div class="an-cot-song-embed"><p><a href="'.esc_url($url).'" target="_blank" rel="noopener">Mở ứng dụng toàn màn hình / Cài để nhận thông báo</a></p><iframe src="'.esc_url($url).'" title="An Cột Sống" loading="lazy" style="width:100%;height:90vh;min-height:600px;border:0" allow="autoplay"></iframe></div>';
});
add_action('admin_menu', function () {
    add_options_page('An Cột Sống', 'An Cột Sống', 'manage_options', 'an-cot-song', 'acs_admin_page');
});
add_action('admin_init', function () {
    register_setting('acs_settings', 'acs_push_backend', ['type'=>'string','sanitize_callback'=>function($value) {
        $url=esc_url_raw(trim($value));
        if (!$url) return '';
        $host=wp_parse_url($url, PHP_URL_HOST);$scheme=wp_parse_url($url, PHP_URL_SCHEME);
        if ($scheme!=='https' && !($scheme==='http' && in_array($host,['127.0.0.1','localhost'],true))) {
            add_settings_error('acs_push_backend','invalid','Dùng URL HTTPS hoặc http://127.0.0.1:3000 trên cùng VPS.');return get_option('acs_push_backend','');
        }
        return rtrim($url,'/');
    }]);
});
function acs_admin_page() {
    if (!current_user_can('manage_options')) return;
    echo '<div class="wrap"><h1>An Cột Sống</h1><p>Dán shortcode <code>[an_cot_song]</code> vào trang /an-cot-song. Google Sheet tiếp tục quản lý nội dung qua CMS_ENDPOINT trong app/An-Cot-Song.html.</p><p>Web Push cần dịch vụ Node chạy liên tục. Nếu hosting không chạy Node/Docker, đặt dịch vụ trên VPS riêng và nhập URL HTTPS dưới đây. Để trống thì tính năng gửi push chưa hoạt động.</p><form method="post" action="options.php">';
    settings_fields('acs_settings');
    echo '<label>URL máy chủ Web Push <input type="url" name="acs_push_backend" value="'.esc_attr(get_option('acs_push_backend','')).'" style="width:500px;max-width:100%" placeholder="http://127.0.0.1:3000"></label>';
    submit_button();echo '</form></div>';
}
add_action('rest_api_init', function () {
    register_rest_route('an-cot-song/v1', '/push/(?P<path>public-key|devices(?:/[a-f0-9-]+(?:/test)?)?)', [
        'methods'=>['GET','POST','PUT','DELETE'], 'permission_callback'=>'__return_true', 'callback'=>'acs_push_proxy'
    ]);
});
function acs_push_proxy(WP_REST_Request $request) {
    $backend=get_option('acs_push_backend','');
    if (!$backend) return new WP_Error('acs_not_configured','Quản trị viên chưa cấu hình máy chủ Web Push.',['status'=>503]);
    $site=wp_parse_url(home_url());$origin=$site['scheme'].'://'.$site['host'].(isset($site['port'])?':'.$site['port']:'');
    $input_origin=$request->get_header('origin');
    if ($input_origin && rtrim($input_origin,'/')!==$origin) return new WP_Error('acs_origin','Sai origin.',['status'=>403]);
    $path=$request['path'];$method=$request->get_method();
    $allowed=($path==='public-key'&&$method==='GET')||($path==='devices'&&$method==='POST')||(preg_match('~^devices/[a-f0-9-]+$~',$path)&&in_array($method,['PUT','DELETE'],true))||(preg_match('~^devices/[a-f0-9-]+/test$~',$path)&&$method==='POST');
    if (!$allowed) return new WP_Error('acs_method','Yêu cầu không hợp lệ.',['status'=>405]);
    $body=$request->get_body();if(strlen($body)>100000)return new WP_Error('acs_size','Dữ liệu quá lớn.',['status'=>413]);
    $ip=isset($_SERVER['REMOTE_ADDR'])?$_SERVER['REMOTE_ADDR']:'';$rate_key='acs_rate_'.md5($ip.gmdate('YmdHi'));
    $count=(int)get_transient($rate_key);if($count>=30)return new WP_Error('acs_rate','Thử lại sau một phút.',['status'=>429]);set_transient($rate_key,$count+1,120);
    $headers=['Content-Type'=>'application/json','Origin'=>$origin];$authorization=$request->get_header('authorization');
    if ($authorization && preg_match('~^Bearer [a-zA-Z0-9_-]{30,100}$~',$authorization)) $headers['Authorization']=$authorization;
    $response=wp_remote_request($backend.'/'.$path,['method'=>$method,'headers'=>$headers,'body'=>$body,'timeout'=>15,'redirection'=>0]);
    if(is_wp_error($response))return new WP_Error('acs_backend','Không kết nối được máy chủ Web Push.',['status'=>502]);
    $json=json_decode(wp_remote_retrieve_body($response),true);if(!is_array($json))return new WP_Error('acs_response','Máy chủ không trả JSON hợp lệ.',['status'=>502]);
    $result=new WP_REST_Response($json,wp_remote_retrieve_response_code($response));$result->header('Cache-Control','no-store');return $result;
}
