

require "colorize"

module Jekyll

  class Site

    alias orig_process process
    def process

      @preview_mode = ENV.has_key?('OCTOPRESS_ENV') && ENV['OCTOPRESS_ENV'] == 'preview'

      if @preview_mode
        puts "Generating for preview...".colorize( :red )
      else
        puts "Generating for production...".colorize( :green )
      end

      start = Time.now
      orig_process
      puts "Generation done. Took #{ Time.now - start } seconds".colorize( :green )
      File.open "public/generated", "w" do |f|
        f.write(Time.now.to_s)
      end
    end

  end
end
