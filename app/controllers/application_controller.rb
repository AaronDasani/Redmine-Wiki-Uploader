class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
  REDMINE_URL = '<redmine URL>'      # eg 'https://example.plan.io'
  API_KEY = '<API KEY>'         # eg 'ffff0000eeee1111dddd2222cccc3333bbbb4444'
  UPLOAD_URL = "#{REDMINE_URL}/uploads.json?key=#{API_KEY}"  

end
