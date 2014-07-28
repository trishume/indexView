SITE_NAME = File.basename(Dir.pwd)
DEPLOY_PATH = ENV['SITE_DEPLOY_PATH']
SITE_ROOT = File.join(DEPLOY_PATH, SITE_NAME)
IGNORE = %w{Rakefile Gemfile Gemfile.lock Readme.md}

desc "Deploy working copy of site"
task :deploy do
  raise "No deploy path" unless DEPLOY_PATH
  system  "jekyll build -d #{SITE_ROOT}"
  IGNORE.each do |f|
    rm File.join(SITE_ROOT, f)
  end
end

