class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
  # REDMINE_URL = '<redmine URL>'      # eg 'https://example.plan.io'
  # API_KEY = '<API KEY>'         # eg 'ffff0000eeee1111dddd2222cccc3333bbbb4444'
  # UPLOAD_URL = "#{REDMINE_URL}/uploads.json?key=#{API_KEY}"  
  
   # LEGACY REDMINE
  # REDMINE_URL = 'http://amtredmine-legacy'      # eg 'https://example.plan.io'
  # API_KEY = 'caf9d2ad62abd55ce60fa8f71edfa23d076a2b6a'         # eg 'ffff0000eeee1111dddd2222cccc3333bbbb4444'
  
  #LIVE REDMINE
  REDMINE_URL = 'http://amtredmine' 
  API_KEY='a9db0739f22507135e46f301b87ace1ed13e80a2'
  UPLOAD_URL = "#{REDMINE_URL}/uploads.json?key=#{API_KEY}"
 
end
